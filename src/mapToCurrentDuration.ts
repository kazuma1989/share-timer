import { shareRecent } from "$lib/util/shareRecent"
import {
  combineLatestWith,
  map,
  Observable,
  pipe,
  type OperatorFunction,
} from "rxjs"
import type { TimerState } from "./schema/timerReducer"

export interface CurrentDuration {
  mode: TimerState["mode"]
  duration: number
}

export function mapToCurrentDuration(
  now$: Observable<number>
): OperatorFunction<TimerState, CurrentDuration> {
  return pipe(
    combineLatestWith(now$),
    map(([state, now]) => {
      switch (state.mode) {
        case "editing": {
          return {
            mode: state.mode,
            duration: state.initialDuration,
          }
        }

        case "running": {
          return {
            mode: state.mode,
            duration: state.restDuration - (now - state.startedAt),
          }
        }

        case "paused": {
          return {
            mode: state.mode,
            duration: state.restDuration,
          }
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

      const actual$ = base$.pipe(
        mapToCurrentDuration(interval$.pipe(map(nowMock)))
      )

      expectObservable(actual$).toBe("--12-3|", {
        1: {
          mode: "running",
          duration: 3 * 60_000 - 1,
        },
        2: {
          mode: "running",
          duration: 3 * 60_000 - 2,
        },
        3: {
          mode: "running",
          duration: 3 * 60_000 - 3,
        },
      })
    })
  })
}
