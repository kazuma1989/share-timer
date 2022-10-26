import { distinctUntilChanged, map, Observable } from "rxjs"
import { FlashCover } from "./FlashCover"
import { toTimerState } from "./observeTimerState"
import { Timer } from "./Timer"
import { TimerState } from "./timerReducer"
import { useFirestore } from "./useFirestore"
import { mapGetOrPut } from "./util/mapGetOrPut"
import { Room } from "./zod/roomZod"

export function App({ room$ }: { room$: Observable<Room> }) {
  // useTitleAsTimeViewer()

  const db = useFirestore()

  const timerState$ = getOrPut(room$, () =>
    room$.pipe(
      map((_) => _.id),
      distinctUntilChanged(),
      toTimerState(db)
    )
  )

  return (
    <div className="container mx-auto h-screen">
      <Timer timerState$={timerState$} className="h-full" />

      <FlashCover timerState$={timerState$} />
    </div>
  )
}

const getOrPut = mapGetOrPut(
  new WeakMap<Observable<Room>, Observable<TimerState>>()
)
