import clsx from "clsx"
import { useEffect, useState } from "react"
import { map, Observable } from "rxjs"
import { TimerState } from "./timerReducer"
import { useAudio } from "./useAudio"
import {
  useCurrentDurationUI,
  useCurrentDurationWorker,
} from "./useCurrentDuration"
import { useObservable } from "./useObservable"
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
      className={clsx(state === "asleep" && "hidden", className)}
    />
  )
}

function FlashCoverInner({ className }: { className?: string }) {
  useAlertSound()

  const duration$ = useCurrentDurationUI()

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

function useAlertSound(): void {
  const audio = useAudio()
  const duration$ = useCurrentDurationWorker()

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
