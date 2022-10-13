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
  const delta = useTimer(startedAt ?? 0)

  return (
    <span className={className}>
      {formatDuration(duration ? duration - delta : 0)}
    </span>
  )
}
