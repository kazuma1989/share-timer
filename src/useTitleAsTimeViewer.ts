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
    const abort = new AbortController()

    const previousTitle = document.title
    abort.signal.addEventListener("abort", () => {
      document.title = previousTitle
    })

    const setTitle = (duration: number) => {
      document.title = formatDuration(duration)
    }

    switch (mode) {
      case "paused": {
        setTitle(restDuration)
        break
      }

      case "running": {
        const timer = new TimerWorker()
        abort.signal.addEventListener("abort", () => {
          timer.terminate()
        })

        const current = () => duration - (Date.now() - startedAt)
        setTitle(current())

        timer.addEventListener("message", () => {
          setTitle(current())
        })

        timer.postMessage({ duration, startedAt })
        break
      }
    }

    return () => {
      abort.abort()
    }
  }, [duration, mode, restDuration, startedAt])
}
