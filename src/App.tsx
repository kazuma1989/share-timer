import { Observable, partition } from "rxjs"
import { isRoom, mapToRoom } from "./mapToRoom"
import { mapToRoomId, Route } from "./mapToRoute"
import { mapToSetupRoom } from "./mapToSetupRoom"
import { RoomView } from "./RoomView"
import { useFirestore } from "./useFirestore"
import { useObservable } from "./useObservable"
import { createCache } from "./util/createCache"
import { pauseWhileLoop } from "./util/pauseWhileLoop"
import { sparse } from "./util/sparse"

export function App({ route$ }: { route$: Observable<Route> }) {
  const db = useFirestore()

  const [room$, setupRoom$] = cache(route$, () => {
    const [room$, invalid$] = partition(
      route$.pipe(mapToRoomId(), mapToRoom(db)),
      isRoom
    )

    return [
      room$,
      invalid$.pipe(
        sparse(200),
        pauseWhileLoop({
          criteria: import.meta.env.PROD ? 20 : 5,
          debounce: 2_000,
          onLoopDetected() {
            throw new Error(
              "Detect room initialization loop. Something went wrong"
            )
          },
        }),
        mapToSetupRoom(db)
      ),
    ]
  })

  const setupRoom = useObservable(setupRoom$, null)
  setupRoom?.()

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

const cache = createCache()
