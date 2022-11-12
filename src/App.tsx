import { useEffect } from "react"
import { Observable } from "rxjs"
import { Route } from "./mapToRoute"
import { replaceHash } from "./observeHash"
import { RoomView } from "./RoomView"
import { useObservable } from "./useObservable"
import { newRoomId, Room } from "./zod/roomZod"

export function App({
  route$,
  room$,
}: {
  route$: Observable<Route>
  room$: Observable<Room>
}) {
  const [route, payload] = useObservable(route$)

  useEffect(() => {
    if (route !== "unknown") return

    if (["", "new"].includes(payload)) {
      replaceHash(newRoomId())
    }
  }, [payload, route])

  switch (route) {
    case "info": {
      return <div>INFO</div>
    }

    case "room": {
      return <RoomView room$={room$} />
    }

    case "unknown": {
      return <div>404 &quot;{payload}&quot;</div>
    }
  }
}
