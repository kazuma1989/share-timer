import { Observable } from "rxjs"
import { Route } from "./mapToRoute"
import { RoomView } from "./RoomView"
import { useObservable } from "./useObservable"
import { Room } from "./zod/roomZod"

export function App({
  route$,
  room$,
}: {
  route$: Observable<Route>
  room$: Observable<Room>
}) {
  const [route, payload] = useObservable(route$)

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
