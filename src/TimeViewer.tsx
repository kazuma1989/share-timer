import { useSyncExternalStore } from "react"
import { formatDuration } from "./formatDuration"
import { subscribeTimer } from "./subscribeTimer"

export function TimeViewer({
  duration,
  startedAt,
  className,
}: {
  duration?: number
  startedAt?: number
  className?: string
}) {
  const restDuration = useSyncExternalStore(subscribeTimer, () => {
    if (duration === undefined || startedAt === undefined) return

    const rest = duration - (subscribeTimer.now() - startedAt)
    return rest - (rest % 1_000)
  })

  return <span className={className}>{formatDuration(restDuration ?? 0)}</span>
}
