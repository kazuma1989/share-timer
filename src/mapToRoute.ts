import { filter, map, OperatorFunction, pipe } from "rxjs"
import { nonNullable } from "./util/nonNullable"
import { isRoomId, Room } from "./zod/roomZod"

export type Route =
  | [key: "room", roomId: Room["id"]]
  | [key: "info"]
  | [key: "unknown", payload: string]

export function mapToRoute(): OperatorFunction<string, Route> {
  return map((value): Route => {
    if (value === "info") {
      return ["info"]
    }

    if (isRoomId(value)) {
      return ["room", value]
    }

    return ["unknown", value]
  })
}

export function mapToRoomId(): OperatorFunction<Route, Room["id"]> {
  return pipe(
    map(([type, payload]) => (type === "room" ? payload : null)),
    filter(nonNullable)
  )
}
