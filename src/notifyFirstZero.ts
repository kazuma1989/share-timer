import { distinctUntilChanged, pipe, scan, type OperatorFunction } from "rxjs"
import type { CurrentDuration } from "./mapToCurrentDuration"

export function notifyFirstZero(): OperatorFunction<CurrentDuration, boolean> {
  return pipe(
    scan((acc, { mode, duration }) => {
      switch (mode) {
        case "editing": {
          return false
        }

        case "paused":
        case "running": {
          // 一度 true に変わったら editing にならない限りずっと true.
          return acc || (-150 <= duration && duration < 50)
        }
      }
    }, false),
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
      const base$ = hot<CurrentDuration>("1-2-3-4-5-6|", {
        1: {
          mode: "editing",
          duration: 2000,
        },
        2: {
          mode: "running",
          duration: 2000,
        },
        3: {
          mode: "running",
          duration: 1000,
        },
        4: {
          mode: "running",
          duration: 0,
        },
        5: {
          mode: "running",
          duration: 0,
        },
        6: {
          mode: "running",
          duration: -1000,
        },
      })

      const actual$ = base$.pipe(notifyFirstZero())

      expectObservable(actual$).toBe("1-----4----|", {
        1: false,
        4: true,
      })
    })
  })

  test("start from zero", () => {
    scheduler.run(({ expectObservable, hot }) => {
      const base$ = hot<CurrentDuration>("1-2-3-4|", {
        1: {
          mode: "editing",
          duration: 0,
        },
        2: {
          mode: "running",
          duration: 0,
        },
        3: {
          mode: "running",
          duration: 0,
        },
        4: {
          mode: "running",
          duration: -1000,
        },
      })

      const actual$ = base$.pipe(notifyFirstZero())

      expectObservable(actual$).toBe("1-2----|", {
        1: false,
        2: true,
      })
    })
  })

  test("reset on editing", () => {
    scheduler.run(({ expectObservable, hot }) => {
      const base$ = hot<CurrentDuration>("1-2-3-4-5-6|", {
        1: {
          mode: "editing",
          duration: 1000,
        },
        2: {
          mode: "running",
          duration: 1000,
        },
        3: {
          mode: "running",
          duration: 0,
        },
        4: {
          mode: "editing",
          duration: 1000,
        },
        5: {
          mode: "running",
          duration: 1000,
        },
        6: {
          mode: "running",
          duration: 0,
        },
      })

      const actual$ = base$.pipe(notifyFirstZero())

      expectObservable(actual$).toBe("1---3-4---6|", {
        1: false,
        3: true,
        4: false,
        6: true,
      })
    })
  })
}
