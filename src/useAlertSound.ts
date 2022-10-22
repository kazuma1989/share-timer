import { useEffect } from "react"
import { now } from "./now"
import smallAlert from "./sound/small-alert.mp3"
import { TimerState } from "./useTimerState"
import IntervalWorker from "./util/interval.worker?worker&inline"

export function useAlertSound({
  mode,
  restDuration,
  startedAt,
}: TimerState): void {
  useEffect(() => {
    if (mode !== "running") return

    const abort = new AbortController()

    const interval = new IntervalWorker()
    abort.signal.addEventListener("abort", () => {
      interval.terminate()
    })

    const audio = new Audio(smallAlert)

    let played: Promise<void> | undefined
    const playSoundOnceDurationReachedZero = () => {
      if (played) return

      const duration = restDuration - (now() - startedAt)
      if (-150 < duration && duration <= 50) {
        played = audio.play()
      }
    }

    playSoundOnceDurationReachedZero()
    interval.addEventListener("message", () => {
      playSoundOnceDurationReachedZero()
    })

    interval.postMessage(["start", 100])

    return () => {
      abort.abort()
    }
  }, [mode, restDuration, startedAt])
}
