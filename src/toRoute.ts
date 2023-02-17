import { isOwnerId, isRoomId, type Room } from "./schema/roomSchema"

export type Route =
  | [key: "room", roomId: Room["id"]]
  | [key: "info", roomId: Room["id"]]
  | [key: "newRoom", payload: string, owner?: string]
  | [key: "unknown", payload: string]

export function toRoute(value: string): Route {
  if (value === "") {
    return ["newRoom", value]
  }

  const unknownRoute: Route = ["unknown", value]

  const params = value.split("/")

  const last = params.pop()!
  switch (last) {
    case "info": {
      const roomId = params.join("/")
      return isRoomId(roomId) ? ["info", roomId] : unknownRoute
    }

    case "new": {
      const ownerId = params.join("/")
      if (ownerId === "") {
        return ["newRoom", value]
      }

      return isOwnerId(ownerId) ? ["newRoom", value, ownerId] : unknownRoute
    }

    default: {
      return isRoomId(value) ? ["room", value] : unknownRoute
    }
  }
}

export function fromRoute(route: Route): string {
  const [key, payload] = route
  switch (key) {
    case "room": {
      return payload
    }

    case "info": {
      return `${payload}/info`
    }

    case "newRoom":
    case "unknown": {
      return payload
    }
  }
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("toRoute newRoom", () => {
    expect(toRoute("")).toStrictEqual(["newRoom", ""] satisfies Route)
  })

  test("toRoute newRoom", () => {
    expect(toRoute("new")).toStrictEqual(["newRoom", "new"] satisfies Route)
  })

  test("toRoute newRoom", () => {
    expect(toRoute("olive/new")).toStrictEqual([
      "newRoom",
      "olive/new",
      "olive",
    ] satisfies Route)
  })

  test("toRoute room", () => {
    expect(toRoute("aaa-bbbb-ccc")).toStrictEqual([
      "room",
      "aaa-bbbb-ccc" as Room["id"],
    ] satisfies Route)
  })

  test("toRoute room", () => {
    expect(toRoute("olive/aaa-bbbb-ccc")).toStrictEqual([
      "room",
      "olive/aaa-bbbb-ccc" as Room["id"],
    ] satisfies Route)
  })

  test("toRoute info", () => {
    expect(toRoute("aaa-bbbb-ccc/info")).toStrictEqual([
      "info",
      "aaa-bbbb-ccc" as Room["id"],
    ] satisfies Route)
  })

  test("toRoute info", () => {
    expect(toRoute("olive/aaa-bbbb-ccc/info")).toStrictEqual([
      "info",
      "olive/aaa-bbbb-ccc" as Room["id"],
    ] satisfies Route)
  })

  test("toRoute unknown", () => {
    const patterns = [
      "new/",
      "oli/ve/new",
      "aaa-????-ccc",
      "aaa-bbbb-ccc/",
      "oli/ve/aaa-bbbb-ccc",
      "aaa-????-ccc/info",
      "aaa-bbbb-ccc/info/",
      "oli/ve/aaa-bbbb-ccc/info",
    ]

    patterns.forEach((value) => {
      expect(toRoute(value)).toStrictEqual(["unknown", value] satisfies Route)
    })
  })

  test("fromRoute", () => {
    const patterns = [
      // new
      "",
      "new",
      "olive/new",

      // room
      "aaa-bbbb-ccc",
      "olive/aaa-bbbb-ccc",

      // info
      "aaa-bbbb-ccc/info",
      "olive/aaa-bbbb-ccc/info",

      // unknown
      "new/",
      "oli/ve/new",
      "aaa-????-ccc",
      "aaa-bbbb-ccc/",
      "oli/ve/aaa-bbbb-ccc",
      "aaa-????-ccc/info",
      "aaa-bbbb-ccc/info/",
      "oli/ve/aaa-bbbb-ccc/info",
    ]

    patterns.forEach((value) => {
      expect(fromRoute(toRoute(value))).toBe(value)
    })
  })
}
