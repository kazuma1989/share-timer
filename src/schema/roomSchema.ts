import * as s from "superstruct"
import { nanoid } from "../util/nanoid"

export interface Room extends s.Infer<typeof roomSchema> {
  id: string & { readonly roomId: unique symbol }
}

export interface RoomInput extends s.Infer<typeof roomSchema> {}

export type InvalidDoc = [reason: "invalid-doc", payload: Room["id"]]

export function isRoom(value: Room | InvalidDoc): value is Room {
  return !Array.isArray(value)
}

export const roomSchema = /*@__PURE__*/ (() =>
  s.type({
    name: s.optional(s.size(s.string(), 0, 1_000)),
    lockedBy: s.optional(s.size(s.string(), 10)),
  }))()

const roomIdSchema = /*@__PURE__*/ (() =>
  s.define<Room["id"]>(
    "Room.id",
    (_) => typeof _ === "string" && isRoomId(_)
  ))()

export function isRoomId(id: string): id is Room["id"] {
  return /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(id)
}

export function newRoomId(): Room["id"] {
  return nanoid(10).replace(/^(.{3})(.{4})(.{3})$/, "$1-$2-$3") as Room["id"]
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("room id", () => {
    expect(s.validate("cnz-some-fmy", roomIdSchema)[1]).toBe("cnz-some-fmy")
  })

  test("generate valid room id", () => {
    const id = newRoomId()

    expect(s.validate(id, roomIdSchema)[1]).toBe(id)
  })

  test("invalid room id", () => {
    expect(() => s.assert("-cnz-some-fmy", roomIdSchema)).toThrow(s.StructError)
  })

  test("room name", () => {
    const room = {
      name: "彅瀉".repeat(1_000 / 2),
    }

    expect(s.validate(room, roomSchema)[1]).toStrictEqual(room)
  })

  test("invalid room name", () => {
    expect(() =>
      s.assert(
        {
          name: "𩸽".repeat(501),
        },
        roomSchema
      )
    ).toThrow(s.StructError)
  })
}
