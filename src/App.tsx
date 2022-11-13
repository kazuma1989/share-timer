import { Observable } from "rxjs"
import { replaceHash } from "./observeHash"
import { PageInfo } from "./PageInfo"
import { PageRoom } from "./PageRoom"
import { Route } from "./toRoute"
import { useObservable } from "./useObservable"
import { suspend } from "./util/suspend"
import { newRoomId } from "./zod/roomZod"

export function App({ route$ }: { route$: Observable<Route> }) {
  const [route, payload] = useObservable(route$)

  switch (route) {
    case "info": {
      const roomId = payload
      return <PageInfo roomId={roomId} />
    }

    case "room": {
      const roomId = payload
      return <PageRoom roomId={roomId} />
    }

    case "newRoom": {
      return suspend(() => {
        replaceHash(["room", newRoomId()])
      })
    }

    case "unknown": {
      return <div>404 &quot;{payload}&quot;</div>
    }
  }
}
