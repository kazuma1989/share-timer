import { useRequestAnimationFrame } from "./useRequestAnimationFrame"

export function TimeViewer({
  duration,
  startedAt,
  children,
}: {
  duration?: number
  startedAt?: number
  children?: (restDuration: number | undefined) => JSX.Element
}) {
  const restDuration = useRequestAnimationFrame((now) => {
    if (duration === undefined || startedAt === undefined) return

    const rest = duration - (now - startedAt)
    return rest - (rest % 1_000)
  })

  return children?.(restDuration) ?? null
}
