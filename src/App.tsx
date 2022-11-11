import { distinctUntilChanged, map, Observable, partition } from "rxjs"
import { FlashCover } from "./FlashCover"
import { setupRoom } from "./initializeRoom"
import { mapToRoomId, PageType } from "./mapToPageType"
import { isRoom, mapToRoom } from "./mapToRoom"
import { mapToTimerState } from "./mapToTimerState"
import { Timer } from "./Timer"
import { useFirestore } from "./useFirestore"
import { useObservable } from "./useObservable"
import { useTitleAsTimeViewer } from "./useTitleAsTimeViewer"
import { createCache } from "./util/createCache"
import { pauseWhileLoop } from "./util/pauseWhileLoop"
import { sparse } from "./util/sparse"
import { Room } from "./zod/roomZod"

export function App({ room$ }: { room$: Observable<Room> }) {
  const db = useFirestore()

  const timerState$ = cache(room$, () =>
    room$.pipe(
      map((_) => _.id),
      distinctUntilChanged(),
      mapToTimerState(db)
    )
  )

  useTitleAsTimeViewer(timerState$)

  return (
    <div className="container mx-auto h-screen">
      <Timer room$={room$} timerState$={timerState$} className="h-full" />

      <FlashCover timerState$={timerState$} />
    </div>
  )
}

const cache = createCache()

export function App2({ pageType$ }: { pageType$: Observable<PageType> }) {
  const db = useFirestore()

  const [room$, invalid$] = cache(pageType$, () => {
    const [room$, invalid$] = partition(
      pageType$.pipe(mapToRoomId(), mapToRoom(db)),
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
        map(([, roomId]) =>
          setupRoom(db, roomId, new AbortController().signal).catch(
            (_: unknown) => {
              console.debug("aborted setup room", _)
            }
          )
        )
      ),
    ]
  })

  const invalid = useObservable(invalid$, Promise.resolve())
  useObservable(invalid)

  const [type] = useObservable(pageType$)

  switch (type) {
    case "info": {
      return <div>INFO</div>
    }

    case "room": {
      return <App room$={room$} />
    }

    case "unknown": {
      return <div>404</div>
    }
  }
}
