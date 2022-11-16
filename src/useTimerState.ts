import { distinctUntilChanged, map, Observable } from "rxjs"
import { mapToTimerState } from "./mapToTimerState"
import { TimerState } from "./timerReducer"
import { useFirestore } from "./useFirestore"
import { createCache } from "./util/createCache"
import { Room } from "./zod/roomZod"

export function useTimerState(room$: Observable<Room>): Observable<TimerState> {
  const db = useFirestore()

  const timerState$ = cache(room$, () =>
    room$.pipe(
      map((_) => _.id),
      distinctUntilChanged(),
      mapToTimerState(db)
    )
  )

  return timerState$
}

const cache = createCache()
