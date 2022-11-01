import {
  map,
  Observable,
  of,
  OperatorFunction,
  pipe,
  startWith,
  switchMap,
} from "rxjs"
import { now } from "./now"
import { TimerState } from "./timerReducer"
import { shareRecent } from "./util/shareRecent"

export interface CurrentDuration {
  mode: TimerState["mode"]
  duration: number
}

export function mapToCurrentDuration(
  interval$: Observable<void>,
  _now: () => number = now
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
              duration: state.restDuration - (_now() - state.startedAt),
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

    shareRecent()
  )
}

if (import.meta.vitest) {
  const { test, expect, beforeEach } = import.meta.vitest
  const { TestScheduler } = await import("rxjs/testing")

  let scheduler: InstanceType<typeof TestScheduler>
  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toStrictEqual(expected)
    })
  })

  test("basic", () => {
    scheduler.run(({ expectObservable, cold, hot }) => {
      // eslint-disable-next-line no-restricted-globals
      const now0 = Date.now()
      const i = Array(5).keys()
      const nowMock = () => now0 + i.next().value

      const base$ = hot<TimerState>("--1--|", {
        1: {
          mode: "running",
          initialDuration: 5 * 60_000,
          restDuration: 3 * 60_000,
          startedAt: nowMock(),
        },
      })
      const interval$ = cold<void>("-1-2-3|")

      const actual$ = base$.pipe(mapToCurrentDuration(interval$, nowMock))

      expectObservable(actual$).toBe("--01-2-3|", {
        0: {
          mode: "running",
          duration: 3 * 60_000 - 1,
        },
        1: {
          mode: "running",
          duration: 3 * 60_000 - 2,
        },
        2: {
          mode: "running",
          duration: 3 * 60_000 - 3,
        },
        3: {
          mode: "running",
          duration: 3 * 60_000 - 4,
        },
      })
    })
  })
}
