import clsx from "clsx"
import { useEffect, useState } from "react"
import { map, Observable } from "rxjs"
import { mapToCurrentDuration } from "./mapToCurrentDuration"
import { TimerState } from "./timerReducer"
import { useAudio } from "./useAudio"
import { useObservable } from "./useObservable"
import { createCache } from "./util/createCache"
import { interval } from "./util/interval"
import { takeFirstZero } from "./util/takeFirstZero"

export function FlashCover({
  timerState$,
  className,
}: {
  timerState$: Observable<TimerState>
  className?: string
}) {
  const { mode } = useObservable(timerState$)

  const state = mode === "editing" ? "asleep" : "awake"

  return (
    <FlashCoverInner
      key={state}
      timerState$={timerState$}
      className={clsx(state === "asleep" && "hidden", className)}
    />
  )
}

function FlashCoverInner({
  timerState$,
  className,
}: {
  timerState$: Observable<TimerState>
  className?: string
}) {
  useAlertSound(timerState$)

  const duration$ = cache1(timerState$, () =>
    timerState$.pipe(
      mapToCurrentDuration(interval("ui")),
      map((_) => _.duration)
    )
  )

  const [flashing$] = useState(() =>
    duration$.pipe(
      takeFirstZero(),
      map(() => true)
    )
  )

  const flashing = useObservable(flashing$, false)

  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-0",
        flashing && "animate-[flash_1s_ease-out]",
        className
      )}
    />
  )
}

const cache1 = createCache()

function useAlertSound(timerState$: Observable<TimerState>): void {
  const audio = useAudio()
  const duration$ = cache2(timerState$, () =>
    timerState$.pipe(
      mapToCurrentDuration(interval("worker", 100)),
      map((_) => _.duration)
    )
  )

  useEffect(() => {
    const sub = duration$.pipe(takeFirstZero()).subscribe(() => {
      audio.currentTime = 0
      audio.play()
    })

    return () => {
      sub.unsubscribe()

      audio.pause()
      audio.currentTime = 0
    }
  }, [audio, duration$])
}

const cache2 = createCache()
