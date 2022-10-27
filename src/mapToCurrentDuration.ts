import {
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

interface CurrentDuration {
  mode: TimerState["mode"]
  duration: number
}

export function mapToCurrentDuration(
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
