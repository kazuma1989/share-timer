import { distinctUntilChanged, map, of, partition } from "rxjs"
import { FlashCover } from "./FlashCover"
import { isRoom, mapToRoom } from "./mapToRoom"
import { mapToTimerState } from "./mapToTimerState"
import { Timer } from "./Timer"
import { useFirestore } from "./useFirestore"
import { useTitleAsTimeViewer } from "./useTitleAsTimeViewer"
import { createCache } from "./util/createCache"
import { Room } from "./zod/roomZod"

export function PageRoom({ roomId }: { roomId: Room["id"] }) {
  const db = useFirestore()

  const [room$, invalid$] = cacheHard(roomId, () =>
    partition(of(roomId).pipe(mapToRoom(db)), isRoom)
  )

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
