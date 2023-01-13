import * as s from "superstruct"
import { nanoid } from "../util/nanoid"

export interface Room extends s.Infer<typeof roomZod> {
  id: s.Infer<typeof roomIdZod>
}

export interface RoomInput extends s.Infer<typeof roomZod> {}

export type InvalidDoc = [reason: "invalid-doc", payload: Room["id"]]

export function isRoom(value: Room | InvalidDoc): value is Room {
  return !Array.isArray(value)
}

export const roomZod = s.type({
  name: s.optional(s.size(s.string(), 0, 1_000)),
  lockedBy: s.optional(s.size(s.string(), 10)),
})

export const roomIdZod = s.pattern(
  s.string(),
  /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/
) satisfies s.Describe<string> as unknown as s.Describe<
  string & { readonly roomId: unique symbol }
>

export function isRoomId(id: string): id is Room["id"] {
  return s.is(id, roomIdZod)
}

export function newRoomId(): Room["id"] {
  return nanoid(10).replace(/^(.{3})(.{4})(.{3})$/, "$1-$2-$3") as Room["id"]
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("room id", () => {
    expect(s.validate("cnz-some-fmy", roomIdZod)[1]).toBe("cnz-some-fmy")
  })

  test("generate valid room id", () => {
    const id = newRoomId()

    expect(s.validate(id, roomIdZod)[1]).toBe(id)
  })

  test("invalid room id", () => {
    expect(() => s.assert("-cnz-some-fmy", roomIdZod)).toThrow(s.StructError)
  })

  test("room name", () => {
    const room = {
      name: "彅瀉".repeat(1_000 / 2),
    }

    expect(s.validate(room, roomZod)[1]).toStrictEqual(room)
  })

  test("invalid room name", () => {
    expect(() =>
      s.assert(
        {
          name: "𩸽".repeat(501),
        },
        roomZod
      )
    ).toThrow(s.StructError)
  })
}
