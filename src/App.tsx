import { Observable } from "rxjs"
import { PageInfo } from "./PageInfo"
import { PageRoom } from "./PageRoom"
import { Route } from "./toRoute"
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
      const roomId = payload
      return <PageInfo roomId={roomId} />
    }

    case "room": {
      return <PageRoom room$={room$} />
    }

    case "unknown": {
      return <div>404 &quot;{payload}&quot;</div>
    }
  }
}
