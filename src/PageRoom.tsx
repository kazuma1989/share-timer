import { distinctUntilChanged, map, merge, of, partition } from "rxjs"
import { FlashCover } from "./FlashCover"
import { isRoom, mapToRoom } from "./mapToRoom"
import { mapToTimerState } from "./mapToTimerState"
import { setupRoom } from "./restoreRoom"
import { Timer } from "./Timer"
import { useFirestore } from "./useFirestore"
import { useObservable } from "./useObservable"
import { useTitleAsTimeViewer } from "./useTitleAsTimeViewer"
import { createCache } from "./util/createCache"
import { pauseWhileLoop } from "./util/pauseWhileLoop"
import { sparse } from "./util/sparse"
import { suspend } from "./util/suspend"
import { Room } from "./zod/roomZod"

export function PageRoom({ roomId }: { roomId: Room["id"] }) {
  const db = useFirestore()

  const [room$, setup$] = cacheHard(roomId, () => {
    const [room$, invalid$] = partition(of(roomId).pipe(mapToRoom(db)), isRoom)

    const setup$ = merge(
      room$.pipe(map(() => null)),
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
        map(([, roomId]) => {
          let called = false

          return async () => {
            if (called) return
            called = true

            await setupRoom(db, roomId)
          }
        })
      )
    )

    return [room$, setup$]
  })

  const setup = useObservable(setup$)
  if (setup) {
    suspend(setup)
  }

  const timerState$ = cache(room$, () =>
    room$.pipe(
      map((_) => _.id),
      distinctUntilChanged(),
      mapToTimerState(db)
    )
  )

  useTitleAsTimeViewer(timerState$)

  return (
    <div className="max-w-prose mx-auto h-screen">
      <Timer room$={room$} timerState$={timerState$} className="h-full" />

      <FlashCover timerState$={timerState$} />
    </div>
  )
}

const cache = createCache()
const cacheHard = createCache(true)
