import clsx from "clsx"
import { useEffect } from "react"
import {
  distinctUntilChanged,
  filter,
  Observable,
  OperatorFunction,
  pipe,
  scan,
} from "rxjs"
import { CurrentDuration, mapToCurrentDuration } from "./mapToCurrentDuration"
import { TimerState } from "./timerReducer"
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
  const [flashing$, sounding$] = cache(timerState$, () => [
    timerState$.pipe(mapToCurrentDuration(interval("ui")), notifyFirstZero()),
    timerState$.pipe(
      mapToCurrentDuration(interval("worker", 100)),
      notifyFirstZero(),
      filter(Boolean)
    ),
  ])

  const config = useObservable(useConfig())
  import.meta.env.DEV && console.debug(config)

  const audio = useAudio()
  useEffect(() => {
    if (config.sound !== "on") return

    const sub = sounding$.subscribe(() => {
      console.debug("audio.play()")

      audio.pause()
      audio.currentTime = 0
      audio.play()
    })

    return () => {
      sub.unsubscribe()

      audio.pause()
      audio.currentTime = 0
    }
  }, [audio, config.sound, sounding$])

  const flashing = useObservable(flashing$, false)

  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-0 text-cerise-500/75 dark:text-gray-100/75",
        flashing && "animate-flash",
        config.flash !== "on" && "invisible",
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
