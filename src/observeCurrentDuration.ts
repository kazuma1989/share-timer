import { distinctUntilChanged, map, Observable, of, switchMap } from "rxjs"
import { now } from "./now"
import { TimerState } from "./timerReducer"
import { secondPrecisionEqual } from "./util/interval"

export function observeCurrentDuration(
  timerState$: Observable<TimerState>,
  interval$: Observable<void>
): Observable<number> {
  return timerState$.pipe(
    switchMap((state) => {
      switch (state.mode) {
        case "editing": {
          return of(state.initialDuration)
        }

        case "running": {
          return interval$.pipe(
            map(() => state.restDuration - (now() - state.startedAt))
          )
        }

        case "paused": {
          return of(state.restDuration)
        }
      }
    }),
    distinctUntilChanged(secondPrecisionEqual)
  )
}
