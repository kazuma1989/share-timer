import { distinctUntilChanged, map, Observable } from "rxjs"
import { ErrorBoundary } from "./ErrorBoundary"
import { FlashCover } from "./FlashCover"
import { mapToTimerState } from "./mapToTimerState"
import { Timer } from "./Timer"
import { useFirestore } from "./useFirestore"
import { useTitleAsTimeViewer } from "./useTitleAsTimeViewer"
import { mapGetOrPut } from "./util/mapGetOrPut"
import { Room } from "./zod/roomZod"

export function App({ room$ }: { room$: Observable<Room> }) {
  const db = useFirestore()

  const timerState$ = getOrPut(room$, () =>
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

      <ErrorBoundary>
        <FlashCover timerState$={timerState$} />
      </ErrorBoundary>
    </div>
  )
}

const getOrPut = mapGetOrPut()
