import {
  distinctUntilChanged,
  lastValueFrom,
  map,
  Observable,
  skipWhile,
} from "rxjs"
import { FlashCover } from "./FlashCover"
import { mapToTimerState } from "./mapToTimerState"
import { Timer } from "./Timer"
import { useFirestore } from "./useFirestore"
import { useObservable } from "./useObservable"
import { useTitleAsTimeViewer } from "./useTitleAsTimeViewer"
import { createCache } from "./util/createCache"
import { suspend } from "./util/suspend"
import { Room } from "./zod/roomZod"

export function PageRoom({
  roomId,
  room$,
}: {
  roomId: Room["id"]
  room$: Observable<Room>
}) {
  const room = useObservable(room$)
  if (room.id !== roomId) {
    suspend(() =>
      lastValueFrom(room$.pipe(skipWhile((room) => room.id !== roomId)))
    )
  }

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
    <div className="max-w-prose mx-auto h-screen">
      <Timer room$={room$} timerState$={timerState$} className="h-full" />

      <FlashCover timerState$={timerState$} />
    </div>
  )
}

const cache = createCache()
