import clsx from "clsx"
// @ts-expect-error
import { useEffect } from "react"
import { filter, map, Observable, withLatestFrom } from "rxjs"
import { mapToCurrentDuration } from "./mapToCurrentDuration"
import { notifyFirstZero } from "./notifyFirstZero"
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
