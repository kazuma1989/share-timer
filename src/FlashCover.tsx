import clsx from "clsx"
// @ts-expect-error
import { useEffect } from "react"
import {
  distinctUntilChanged,
  filter,
  map,
  Observable,
  pipe,
  scan,
  withLatestFrom,
  type OperatorFunction,
} from "rxjs"
import {
  mapToCurrentDuration,
  type CurrentDuration,
} from "./mapToCurrentDuration"
import { now } from "./now"
import type { TimerState } from "./timerReducer"
import { useAudio } from "./useAudio"
import { useConfig } from "./useConfig"
import { useObservable } from "./useObservable"
import { createCache } from "./util/createCache"
import { interval } from "./util/interval"

export function FlashCover({
  timerState$,
  className,
}: {
  timerState$: Observable<TimerState>
  className?: string
}) {
  const config$ = useConfig()

  const [flashing$, sounding$] = cache(config$, createCache)(
    timerState$,
    () => [
      timerState$.pipe(
        mapToCurrentDuration(interval("ui"), now),
        notifyFirstZero(),
        withLatestFrom(config$),
        map(([_, config]) => config.flash === "on" && _)
      ),

      timerState$.pipe(
        mapToCurrentDuration(interval("worker", 100), now),
        notifyFirstZero(),
        withLatestFrom(config$),
        map(([_, config]) => config.sound === "on" && _)
      ),
    ]
  )

  const audio = useAudio()

  useEffect(() => {
    const sub = sounding$.pipe(filter((_) => _ === true)).subscribe(() => {
      console.debug("audio.play()")
      audio.play()
    })

    return () => {
      sub.unsubscribe()
    }
  }, [audio, sounding$])

  const flashing = useObservable(flashing$, false)

  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-0 text-cerise-500/75 dark:text-gray-100/75",
        flashing && "animate-flash",
        className
      )}
    />
  )
}

const cache = createCache()

function notifyFirstZero(): OperatorFunction<CurrentDuration, boolean> {
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
          duration: 2_000,
        },
        2: {
          mode: "running",
          duration: 2_000,
        },
        3: {
          mode: "running",
          duration: 1_000,
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
          duration: -1_000,
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
          duration: -1_000,
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
          duration: 1_000,
        },
        2: {
          mode: "running",
          duration: 1_000,
        },
        3: {
          mode: "running",
          duration: 0,
        },
        4: {
          mode: "editing",
          duration: 1_000,
        },
        5: {
          mode: "running",
          duration: 1_000,
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
