import {
  distinctUntilChanged,
  map,
  Observable,
  OperatorFunction,
  pipe,
} from "rxjs"
import { CurrentDuration, mapToCurrentDuration } from "./mapToCurrentDuration"
import { TimerState } from "./timerReducer"
import { useObservable } from "./useObservable"
import { createCache } from "./util/createCache"
import { floor } from "./util/floor"
import { formatDuration } from "./util/formatDuration"
import { interval } from "./util/interval"

export function TimeViewer({
  timerState$,
  className,
}: {
  timerState$: Observable<TimerState>
  className?: string
}) {
  const duration$ = cache(timerState$, () =>
    timerState$.pipe(mapToCurrentDuration(interval("ui")), mapToDuration())
  )

  const duration = useObservable(duration$)

  return <span className={className}>{formatDuration(duration)}</span>
}

const cache = createCache()

function mapToDuration(): OperatorFunction<CurrentDuration, number> {
  return pipe(
    map((_) => floor(_.duration)),
    distinctUntilChanged()
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
    scheduler.run(({ expectObservable, hot }) => {
      const base$ = hot<CurrentDuration>("--1--2--3--|", {
        1: {
          mode: "running",
          duration: 3 * 60_000 - 100,
        },
        2: {
          mode: "running",
          duration: 3 * 60_000 - 500,
        },
        3: {
          mode: "running",
          duration: 3 * 60_000 - 2_000,
        },
      })

      const actual$ = base$.pipe(mapToDuration())

      expectObservable(actual$).toBe("--1-----3--|", {
        1: 3 * 60_000 - 1_000,
        3: 3 * 60_000 - 2_000,
      })
    })
  })
}
