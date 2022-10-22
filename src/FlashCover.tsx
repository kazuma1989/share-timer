import clsx from "clsx"
import { useEffect, useState } from "react"
import { now } from "./now"
import { useTimerState } from "./useTimerState"
import { subscribeAnimationFrame } from "./util/subscribeAnimationFrame"
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

    let flashed = false

    return subscribeAnimationFrame(() => {
      if (flashed) return

      const duration = restDuration - (now() - startedAt)
      if (-150 < duration && duration <= 50) {
        setShouldFlash(true)

        flashed = true
      }
    })
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
