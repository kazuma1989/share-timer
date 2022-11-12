import { distinctUntilChanged, filter, map, OperatorFunction, pipe } from "rxjs"
import { isRoomId, Room } from "./zod/roomZod"

export type Route =
  | [key: "room", roomId: Room["id"]]
  | [key: "info", roomId: Room["id"]]
  | [key: "unknown", payload: string]

export function pickOnlyRoomId(): OperatorFunction<Route, Room["id"]> {
  return pipe(
    map(([, payload]) => payload),
    distinctUntilChanged(),
    filter(isRoomId)
  )
}

export function toRoute(value: string): Route {
  const [first, second, ...rest] = value.split("/")

  if (rest.length === 0 && first !== undefined && isRoomId(first)) {
    if (second === undefined) {
      return ["room", first]
    } else if (second === "info") {
      return ["info", first]
    }
  }

  return ["unknown", value]
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
