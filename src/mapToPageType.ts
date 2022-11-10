import { filter, map, OperatorFunction, pipe } from "rxjs"
import { nonNullable } from "./util/nonNullable"
import { isRoomId, Room } from "./zod/roomZod"

export type PageType =
  | [type: "room", payload: Room["id"]]
  | [type: "info"]
  | [type: "unknown"]

export function mapToPageType(): OperatorFunction<string, PageType> {
  return map((value): PageType => {
    if (value === "info") {
      return ["info"]
    }

    if (isRoomId(value)) {
      return ["room", value]
    }

    return ["unknown"]
  })
}

export function mapToRoomId(): OperatorFunction<PageType, Room["id"]> {
  return pipe(
    map(([type, payload]) => (type === "room" ? payload : null)),
    filter(nonNullable)
  )
}
