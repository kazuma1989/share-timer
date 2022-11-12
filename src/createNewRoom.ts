import { Observable } from "rxjs"
import { fromRoute, Route } from "./mapToRoute"
import { replaceHash } from "./observeHash"
import { newRoomId } from "./zod/roomZod"

export function createNewRoom(route$: Observable<Route>): void {
  route$.subscribe(([route, payload]) => {
    if (route !== "unknown") return

    if (["", "new"].includes(payload)) {
      replaceHash(fromRoute(["room", newRoomId()]))
    }
  })
}
