import { formatDuration } from "./formatDuration"
import { useTimer } from "./useTimer"

export function TimeViewer({
  duration,
  startedAt,
  className,
}: {
  duration?: number
  startedAt?: number
  className?: string
}) {
  const now = useTimer()

  return (
    <span className={className}>
      {formatDuration(duration && startedAt ? duration - (now - startedAt) : 0)}
    </span>
  )
}
