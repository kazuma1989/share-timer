import { formatDuration } from "./formatDuration"
import { useTimer } from "./useTimer"

export function TimeViewer({
  duration,
  startedAt,
}: {
  duration: number
  startedAt: number
}) {
  const now = useTimer()

  return <span>{formatDuration(duration - (now - startedAt))}</span>
}
