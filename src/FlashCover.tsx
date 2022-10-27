import clsx from "clsx"
import { useEffect, useState } from "react"
import { map, Observable } from "rxjs"
import { toCurrentDuration } from "./observeCurrentDuration"
import { TimerState } from "./timerReducer"
import { useAudio } from "./useAudio"
import { useObservable } from "./useObservable"
import { interval } from "./util/interval"
import { mapGetOrPut } from "./util/mapGetOrPut"
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

  const duration$ = getOrPut(timerState$, () =>
    timerState$.pipe(
      toCurrentDuration(interval("ui")),
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

function useAlertSound(timerState$: Observable<TimerState>): void {
  const audio = useAudio()
  const duration$ = getOrPut(timerState$, () =>
    timerState$.pipe(
      toCurrentDuration(interval("worker", 100)),
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

const getOrPut = mapGetOrPut(
  new WeakMap<Observable<TimerState>, Observable<number>>()
)
