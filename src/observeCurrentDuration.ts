import {
  distinctUntilChanged,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
} from "rxjs"
import { now } from "./now"
import { TimerState } from "./timerReducer"
import { secondsPrecisionEqual } from "./util/interval"

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
            startWith(null),
            map(() => state.restDuration - (now() - state.startedAt))
          )
        }

        case "paused": {
          return of(state.restDuration)
        }
      }
    }),
    distinctUntilChanged(secondsPrecisionEqual),

    shareReplay({
      bufferSize: 1,
      refCount: true,
    })
  )
}
