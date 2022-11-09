import { distinctUntilChanged, map, Observable } from "rxjs"
import { FlashCover } from "./FlashCover"
import { mapToTimerState } from "./mapToTimerState"
import { Timer } from "./Timer"
import { useFirestore } from "./useFirestore"
import { useObservable } from "./useObservable"
import { useTitleAsTimeViewer } from "./useTitleAsTimeViewer"
import { createCache } from "./util/createCache"
import { Room } from "./zod/roomZod"

export function App({
  room$,
  anotherPageId$,
}: {
  room$: Observable<Room>
  anotherPageId$: Observable<string | null>
}) {
  const id = useObservable(anotherPageId$)
  if (id) {
    return <div className="text-9xl">id: {id}</div>
  }

  return <TimerPage room$={room$} />
}

function TimerPage({ room$ }: { room$: Observable<Room> }) {
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
