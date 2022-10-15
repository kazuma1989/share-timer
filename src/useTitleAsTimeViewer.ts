import { useEffect } from "react"
import { formatDuration } from "./formatDuration"
import { TimerState } from "./Timer"
import TimerWorker from "./TimerWorker?worker"

export function useTitleAsTimeViewer(state: TimerState): void {
  const mode = state.mode

  let duration = NaN
  let startedAt = NaN
  switch (state.mode) {
    case "paused": {
      duration = state.restDuration
      break
    }

    case "editing": {
      duration = state.initialDuration
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

    const setTitle = (duration: number, startedAt?: number) => {
      document.title = startedAt
        ? formatDuration(duration - (Date.now() - startedAt))
        : formatDuration(duration)
    }

    switch (mode) {
      case "paused":
      case "editing": {
        setTitle(duration)
        break
      }

      case "running": {
        const timer = new TimerWorker()
        abort.signal.addEventListener("abort", () => {
          timer.terminate()
        })

        setTitle(duration, startedAt)
        timer.addEventListener("message", () => {
          setTitle(duration, startedAt)
        })

        timer.postMessage({ duration, startedAt })
        break
      }
    }

    return () => {
      abort.abort()
    }
  }, [duration, mode, startedAt])
}
