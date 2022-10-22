import { useEffect } from "react"
import { formatDuration } from "./formatDuration"
import { now } from "./now"
import { TimerState } from "./useTimerState"
import IntervalWorker from "./util/interval.worker?worker&inline"

export function useTitleAsTimeViewer({
  mode,
  initialDuration,
  restDuration,
  startedAt,
}: TimerState): void {
  useEffect(() => {
    const abort = new AbortController()

    const previousTitle = document.title
    abort.signal.addEventListener("abort", () => {
      document.title = previousTitle
    })

    let previousRestDuration: number
    const setTitle = (duration: number, startedAt?: number) => {
      const restDuration = startedAt ? duration - (now() - startedAt) : duration
      if (restDuration === previousRestDuration) return

      previousRestDuration = restDuration
      document.title = formatDuration(restDuration)
    }

    switch (mode) {
      case "editing": {
        setTitle(initialDuration)
        break
      }

      case "running": {
        const interval = new IntervalWorker()
        abort.signal.addEventListener("abort", () => {
          interval.terminate()
        })

        setTitle(restDuration, startedAt)
        interval.addEventListener("message", () => {
          setTitle(restDuration, startedAt)
        })

        interval.postMessage(["start", 500])
        break
      }

      case "paused": {
        setTitle(restDuration)
        break
      }
    }

    return () => {
      abort.abort()
    }
  }, [initialDuration, mode, restDuration, startedAt])
}
