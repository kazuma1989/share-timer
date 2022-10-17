import { useEffect } from "react"
import { formatDuration } from "./formatDuration"
import { now } from "./now"
import { TimerState } from "./useTimerState"
import IntervalWorker from "./util/interval.worker?worker&inline"

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

    let previousRestDuration: number
    const setTitle = (duration: number, startedAt?: number) => {
      const restDuration = startedAt ? duration - (now() - startedAt) : duration
      if (restDuration === previousRestDuration) return

      previousRestDuration = restDuration
      document.title = formatDuration(restDuration)
    }

    switch (mode) {
      case "paused":
      case "editing": {
        setTitle(duration)
        break
      }

      case "running": {
        const interval = new IntervalWorker()
        abort.signal.addEventListener("abort", () => {
          interval.terminate()
        })

        setTitle(duration, startedAt)
        interval.addEventListener("message", () => {
          setTitle(duration, startedAt)
        })

        interval.postMessage("start")
        break
      }
    }

    return () => {
      abort.abort()
    }
  }, [duration, mode, startedAt])
}
