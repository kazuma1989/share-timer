import clsx from "clsx"
import { useEffect, useState } from "react"
import { now } from "./now"
import { useTimerState } from "./useTimerState"
import IntervalWorker from "./util/interval.worker?worker&inline"
import { Room } from "./zod/roomZod"

export function FlashCover({
  roomId,
  className,
}: {
  roomId: Room["id"]
  className?: string
}) {
  const { mode, restDuration, startedAt } = useTimerState(roomId)

  const [shouldFlash, setShouldFlash] = useState(false)
  useEffect(() => {
    if (mode !== "running") return

    const abort = new AbortController()

    const interval = new IntervalWorker()
    abort.signal.addEventListener("abort", () => {
      interval.terminate()
    })

    let flashed = false
    const flashOnceDurationReachedZero = () => {
      if (flashed) return

      const duration = restDuration - (now() - startedAt)
      if (-150 < duration && duration <= 50) {
        setShouldFlash(true)
        flashed = true
      }
    }

    flashOnceDurationReachedZero()
    interval.addEventListener("message", flashOnceDurationReachedZero)

    interval.postMessage(["start", 100])

    return () => {
      abort.abort()
    }
  }, [mode, restDuration, startedAt])

  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-0 transition-colors",
        shouldFlash && "bg-white/75",
        className
      )}
      onTransitionEnd={() => {
        setShouldFlash(false)
      }}
    />
  )
}
