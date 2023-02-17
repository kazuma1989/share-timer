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
  return /^(?:[0-9a-z_-]{3,}\/)?[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(id)
}

export function parseRoomId(id: Room["id"]): { owner?: string; room: string } {
  if (!id.includes("/")) {
    return { room: id }
  }

  const [owner, room] = id.split("/")
  return { owner, room: room! }
}

export function newRoomId(ownerId?: OwnerId): Room["id"] {
  return ((ownerId ? `${ownerId}/` : "") +
    nanoid(10).replace(/^(.{3})(.{4})(.{3})$/, "$1-$2-$3")) as Room["id"]
}

export type OwnerId = string & { readonly ownerId: unique symbol }

export function isOwnerId(id: string): id is OwnerId {
  return /^[0-9a-z_-]{3,}$/.test(id)
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("room id", () => {
    expect(s.validate("cnz-some-fmy", roomIdSchema)[1]).toBe("cnz-some-fmy")
  })

  test("room id", () => {
    expect(s.validate("olive/cnz-some-fmy", roomIdSchema)[1]).toBe(
      "olive/cnz-some-fmy"
    )
  })

  test("parse room id", () => {
    expect(parseRoomId("olive/cnz-some-fmy" as Room["id"])).toStrictEqual({
      owner: "olive",
      room: "cnz-some-fmy",
    } satisfies ReturnType<typeof parseRoomId>)
  })

  test("generate valid room id", () => {
    const id = newRoomId()

    expect(s.validate(id, roomIdSchema)[1]).toBe(id)
  })

  test("generate valid room id", () => {
    const id = newRoomId("olive" as OwnerId)

    expect(s.validate(id, roomIdSchema)[1]).toBe(id)
  })

  test("invalid room id", () => {
    expect(() => s.assert("-cnz-some-fmy", roomIdSchema)).toThrow(s.StructError)
  })

  test("valid owner id", () => {
    expect(isOwnerId("olive")).toBeTruthy()
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
