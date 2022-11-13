import { distinctUntilChanged, filter, map, OperatorFunction, pipe } from "rxjs"
import { isRoomId, Room } from "./zod/roomZod"

export type Route =
  | [key: "room", roomId: Room["id"]]
  | [key: "info", roomId: Room["id"]]
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

    case "unknown": {
      return payload
    }
  }
}

export function pickOnlyRoomId(): OperatorFunction<Route, Room["id"]> {
  return pipe(
    map(([, payload]) => payload),
    distinctUntilChanged(),
    filter(isRoomId)
  )
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("toRoute", () => {
    expect(toRoute("")).toStrictEqual<Route>(["unknown", ""])
  })

  test("toRoute", () => {
    expect(toRoute("new")).toStrictEqual<Route>(["unknown", "new"])
  })

  test("toRoute", () => {
    expect(toRoute("aaa-bbbb-ccc/")).toStrictEqual<Route>([
      "unknown",
      "aaa-bbbb-ccc/",
    ])
  })

  test("toRoute", () => {
    expect(toRoute("aaa-bbbb-ccc")).toStrictEqual<Route>([
      "room",
      "aaa-bbbb-ccc" as Room["id"],
    ])
  })

  test("toRoute", () => {
    expect(toRoute("aaa-bbbb-ccc/info")).toStrictEqual<Route>([
      "info",
      "aaa-bbbb-ccc" as Room["id"],
    ])
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
