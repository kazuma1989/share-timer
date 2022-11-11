import { Observable, partition, switchMap } from "rxjs"
import { setupRoom } from "./initializeRoom"
import { isRoom, mapToRoom } from "./mapToRoom"
import { mapToRoomId, Route } from "./mapToRoute"
import { RoomView } from "./RoomView"
import { useFirestore } from "./useFirestore"
import { useObservable } from "./useObservable"
import { createCache } from "./util/createCache"
import { pauseWhileLoop } from "./util/pauseWhileLoop"
import { sparse } from "./util/sparse"

export function App({ route$ }: { route$: Observable<Route> }) {
  const db = useFirestore()

  const [room$, invalid$] = cache(route$, () => {
    const [room$, _invalid$] = partition(
      route$.pipe(mapToRoomId(), mapToRoom(db)),
      isRoom
    )

    return [
      room$,
      _invalid$.pipe(
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
        switchMap(async ([, roomId]) => {
          console.log("call setupRoom", roomId)
          await setupRoom(db, roomId, new AbortController().signal).catch(
            (_: unknown) => {
              console.debug("aborted setup room", _)
            }
          )
          console.log("awaited setupRoom", roomId)
        })
      ),
    ]
  })

  useObservable(invalid$, null)

  const [route] = useObservable(route$)
  switch (route) {
    case "info": {
      return <div>INFO</div>
    }

    case "room": {
      return <RoomView room$={room$} />
    }

    case "unknown": {
      return <div>404</div>
    }
  }
}

const cache = createCache()
