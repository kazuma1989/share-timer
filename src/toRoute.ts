import { isRoomId, type Room } from "./schema/roomSchema"

export type Route =
  | [key: "room", roomId: Room["id"]]
  | [key: "info", roomId: Room["id"]]
  | [key: "newRoom", payload: string]
  | [key: "unknown", payload: string]

export function toRoute(value: string): Route {
  if (value === "" || value === "new") {
    return ["newRoom", value]
  }

  const unknownRoute: Route = ["unknown", value]

  if (value.endsWith("/info")) {
    const roomId = value.slice(0, 0 - "/info".length)
    return isRoomId(roomId) ? ["info", roomId] : unknownRoute
  }

  return isRoomId(value) ? ["room", value] : unknownRoute
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

  test("toRoute room", () => {
    expect(toRoute("aaa-bbbb-ccc")).toStrictEqual([
      "room",
      "aaa-bbbb-ccc" as Room["id"],
    ] satisfies Route)
  })

  test("toRoute room", () => {
    expect(toRoute("p-aaa-bbbb-ccc")).toStrictEqual([
      "room",
      "p-aaa-bbbb-ccc" as Room["id"],
    ] satisfies Route)
  })

  test("toRoute info", () => {
    expect(toRoute("aaa-bbbb-ccc/info")).toStrictEqual([
      "info",
      "aaa-bbbb-ccc" as Room["id"],
    ] satisfies Route)
  })

  test("toRoute info", () => {
    expect(toRoute("p-aaa-bbbb-ccc/info")).toStrictEqual([
      "info",
      "p-aaa-bbbb-ccc" as Room["id"],
    ] satisfies Route)
  })

  test("toRoute unknown", () => {
    const patterns = [
      "new/",
      "p-new",
      "aaa-????-ccc",
      "aaa-bbbb-ccc/",
      "z-aaa-bbbb-ccc",
      "aaa-????-ccc/info",
      "aaa-bbbb-ccc/info/",
      "z-aaa-bbbb-ccc/info",
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

      // room
      "aaa-bbbb-ccc",
      "p-aaa-bbbb-ccc",

      // info
      "aaa-bbbb-ccc/info",
      "p-aaa-bbbb-ccc/info",

      // unknown
      "new/",
      "p-new",
      "aaa-????-ccc",
      "aaa-bbbb-ccc/",
      "z-aaa-bbbb-ccc",
      "aaa-????-ccc/info",
      "aaa-bbbb-ccc/info/",
      "z-aaa-bbbb-ccc/info",
    ]

    patterns.forEach((value) => {
      expect(fromRoute(toRoute(value))).toBe(value)
    })
  })
}
