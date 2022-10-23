import { useEffect } from "react"
import { useCurrentDurationWorker } from "./useCurrentDuration"
import { formatDuration } from "./util/formatDuration"

export function useTitleAsTimeViewer(): void {
  const duration$ = useCurrentDurationWorker()

  useEffect(() => {
    const previousTitle = document.title
    const sub = duration$.subscribe((duration) => {
      document.title = formatDuration(duration)
    })

    return () => {
      sub.unsubscribe()
      document.title = previousTitle
    }
  }, [duration$])
}
