import { Observable } from "rxjs"
import { replaceHash } from "./observeHash"
import { Route } from "./toRoute"
import { newRoomId } from "./zod/roomZod"

export function createNewRoom(route$: Observable<Route>): void {
  route$.subscribe(([route, payload]) => {
    if (route !== "unknown") return

    if (["", "new"].includes(payload)) {
      replaceHash(["room", newRoomId()])
    }
  })
}
