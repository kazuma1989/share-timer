import clsx from "clsx"
import { useEffect } from "react"
import {
  distinctUntilChanged,
  filter,
  map,
  Observable,
  OperatorFunction,
  pipe,
  take,
} from "rxjs"
import { CurrentDuration, mapToCurrentDuration } from "./mapToCurrentDuration"
import { TimerState } from "./timerReducer"
import { useAudio } from "./useAudio"
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

  const flashing$ = cache1(timerState$, () =>
    timerState$.pipe(mapToCurrentDuration(interval("ui")), mapToRunningZero())
  )

  const flashing = useObservable(flashing$, false)
  console.log({ flashing })

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

  const flashing$ = cache2(timerState$, () =>
    timerState$.pipe(
      mapToCurrentDuration(interval("worker", 100)),
      mapToRunningZero()
    )
  )

  useEffect(() => {
    const sub = flashing$.pipe(filter(Boolean), take(1)).subscribe(() => {
      console.log("audio.play()")

      audio.currentTime = 0
      audio.play()
    })

    return () => {
      sub.unsubscribe()

      audio.pause()
      audio.currentTime = 0
    }
  }, [audio, flashing$])
}

const cache2 = createCache()

function mapToRunningZero(): OperatorFunction<CurrentDuration, boolean> {
  return pipe(
    map((_) => _.mode !== "editing" && _.duration <= 50),
    distinctUntilChanged()
  )
}
