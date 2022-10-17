import { formatDuration } from "./formatDuration"
import { useRequestAnimationFrame } from "./useRequestAnimationFrame"

export function TimeViewer({
  duration,
  startedAt,
  className,
}: {
  duration?: number
  startedAt?: number
  className?: string
}) {
  const restDuration = useRequestAnimationFrame((now) => {
    if (duration === undefined || startedAt === undefined) return

    const rest = duration - (now - startedAt)
    return rest - (rest % 1_000)
  })

  return <span className={className}>{formatDuration(restDuration ?? 0)}</span>
}
