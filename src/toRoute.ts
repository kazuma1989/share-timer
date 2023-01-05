import { isRoomId, Room } from "./zod/roomZod"

export type Route =
  | [key: "room", roomId: Room["id"]]
  | [key: "info", roomId: Room["id"]]
  | [key: "newRoom", payload: string]
  | [key: "unknown", payload: string]

export function toRoute(value: string): Route {
  const [first, second, ...rest] = value.split("/")
  const unknown: Route = ["unknown", value]

  if (rest.length !== 0) {
    return unknown
  }

  if (first !== undefined && isRoomId(first)) {
    const roomId = first
    switch (second) {
      case undefined: {
        return ["room", roomId]
      }

      case "info": {
        return ["info", roomId]
      }

      default: {
        return unknown
      }
    }
  }

  if (first === "" || first === "new") {
    return ["newRoom", value]
  }

  return unknown
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

  test("toRoute", () => {
    expect(toRoute("")).toStrictEqual(["newRoom", ""] satisfies Route)
  })

  test("toRoute", () => {
    expect(toRoute("new")).toStrictEqual(["newRoom", "new"] satisfies Route)
  })

  test("toRoute", () => {
    expect(toRoute("aaa-bbbb-ccc/")).toStrictEqual([
      "unknown",
      "aaa-bbbb-ccc/",
    ] satisfies Route)
  })

  test("toRoute", () => {
    expect(toRoute("aaa-bbbb-ccc")).toStrictEqual([
      "room",
      "aaa-bbbb-ccc" as Room["id"],
    ] satisfies Route)
  })

  test("toRoute", () => {
    expect(toRoute("aaa-bbbb-ccc/info")).toStrictEqual([
      "info",
      "aaa-bbbb-ccc" as Room["id"],
    ] satisfies Route)
  })

  test("fromRoute", () => {
    const patterns = [
      "",
      "new",
      "aaa-bbbb-ccc/",
      "aaa-bbbb-ccc",
      "aaa-bbbb-ccc/info",
    ]

    patterns.forEach((value) => {
      expect(fromRoute(toRoute(value))).toBe(value)
    })
  })
}
