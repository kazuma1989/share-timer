import { isRoomId, type Room } from "./schema/roomSchema"

export type Route =
  | [key: "room", roomId: Room["id"]]
  | [key: "info", roomId: Room["id"]]
  | [key: "newRoom", payload: string]
  | [key: "unknown", payload: string]

export function toRoute(value: string): Route {
  const [first, second, third, ...rest] = value.split("/")
  const unknown: Route = ["unknown", value]

  if (rest.length !== 0 || first === undefined) {
    return unknown
  }

  const formerPart = `${first}/${second}`

  if (isRoomId(formerPart)) {
    const roomId = formerPart
    switch (third) {
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

  if (isRoomId(first)) {
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

  if (first === "" || first === "new" || second === "new") {
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
    expect(toRoute("olive/new")).toStrictEqual([
      "newRoom",
      "olive/new",
    ] satisfies Route)
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
    expect(toRoute("olive/aaa-bbbb-ccc")).toStrictEqual([
      "room",
      "olive/aaa-bbbb-ccc" as Room["id"],
    ] satisfies Route)
  })

  test("toRoute", () => {
    expect(toRoute("aaa-bbbb-ccc/info")).toStrictEqual([
      "info",
      "aaa-bbbb-ccc" as Room["id"],
    ] satisfies Route)
  })

  test("toRoute", () => {
    expect(toRoute("olive/aaa-bbbb-ccc/info")).toStrictEqual([
      "info",
      "olive/aaa-bbbb-ccc" as Room["id"],
    ] satisfies Route)
  })

  test("fromRoute", () => {
    const patterns = [
      "",
      "new",
      "olive/new",
      "aaa-bbbb-ccc/",
      "aaa-bbbb-ccc",
      "aaa-bbbb-ccc/info",
      "olive/aaa-bbbb-ccc",
      "olive/aaa-bbbb-ccc/info",
    ]

    patterns.forEach((value) => {
      expect(fromRoute(toRoute(value))).toBe(value)
    })
  })
}
