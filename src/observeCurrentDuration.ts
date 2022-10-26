import {
  distinctUntilChanged,
  map,
  Observable,
  of,
  OperatorFunction,
  pipe,
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

export interface CurrentDuration {
  mode: TimerState["mode"]
  duration: number
}

export function toCurrentDuration(
  interval$: Observable<void>
): OperatorFunction<TimerState, CurrentDuration> {
  return pipe(
    switchMap((state) => {
      switch (state.mode) {
        case "editing": {
          return of({
            mode: state.mode,
            duration: state.initialDuration,
          })
        }

        case "running": {
          return interval$.pipe(
            startWith(null),
            map(() => ({
              mode: state.mode,
              duration: state.restDuration - (now() - state.startedAt),
            }))
          )
        }

        case "paused": {
          return of({
            mode: state.mode,
            duration: state.restDuration,
          })
        }
      }
    }),

    shareReplay({
      bufferSize: 1,
      refCount: true,
    })
  )
}
