import { useSyncExternalStore } from "react"
import { formatDuration } from "./formatDuration"
import { now, subscribeTimer } from "./subscribeTimer"

export function TimeViewer({
  duration,
  startedAt,
  className,
}: {
  duration?: number
  startedAt?: number
  className?: string
}) {
  const delta = useSyncExternalStore(subscribeTimer, () => {
    const d = startedAt ? now() - startedAt : 0
    return d - (d % 1_000)
  })

  return (
    <span className={className}>
      {formatDuration(duration ? duration - delta : 0)}
    </span>
  )
}
