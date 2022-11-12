import { filter, map, OperatorFunction, pipe } from "rxjs"
import { nonNullable } from "./util/nonNullable"
import { isRoomId, Room } from "./zod/roomZod"

export type Route =
  | [key: "room", roomId: Room["id"]]
  | [key: "info", roomId: Room["id"]]
  | [key: "unknown", payload: string]

export function mapToRoute(): OperatorFunction<string, Route> {
  return map(toRoute)
}

export function mapToRoomId(): OperatorFunction<Route, Room["id"]> {
  return pipe(
    map(([type, payload]) => (type === "room" ? payload : null)),
    filter(nonNullable)
  )
}

function toRoute(value: string): Route {
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
}
