import { useEffect } from "react"
import { formatDuration } from "./formatDuration"
import { TimerState } from "./Timer"
import TimerWorker from "./TimerWorker?worker"

export function useTitleAsTimeViewer(state: TimerState): void {
  const mode = state.mode

  let restDuration = NaN
  let duration = NaN
  let startedAt = NaN
  switch (state.mode) {
    case "paused": {
      restDuration = state.restDuration
      break
    }

    case "running": {
      duration = state.duration
      startedAt = state.startedAt
      break
    }
  }

  useEffect(() => {
    const title = document.title

    const abort = new AbortController()
    const timer = new TimerWorker()

    timer.addEventListener(
      "message",
      (e) => {
        document.title = formatDuration(e.data)
      },
      {
        passive: true,
        signal: abort.signal,
      }
    )

    timer.postMessage({ mode, restDuration, duration, startedAt })

    return () => {
      document.title = title

      abort.abort()
      timer.terminate()
    }
  }, [duration, mode, restDuration, startedAt])
}
