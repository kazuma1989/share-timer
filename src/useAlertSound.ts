import { useEffect } from "react"
import { now } from "./now"
import { useAlertAudio } from "./useAlertAudio"
import { TimerState } from "./useTimerState"
import IntervalWorker from "./util/interval.worker?worker&inline"

export function useAlertSound({
  mode,
  restDuration,
  startedAt,
}: TimerState): void {
  const audio = useAlertAudio()

  useEffect(() => {
    if (mode !== "running") return

    const abort = new AbortController()

    const interval = new IntervalWorker()
    abort.signal.addEventListener("abort", () => {
      interval.terminate()
    })

    abort.signal.addEventListener("abort", () => {
      audio.pause()
      audio.currentTime = 0
    })

    let played: Promise<void> | undefined
    const playSoundOnceDurationReachedZero = () => {
      if (played) return

      const duration = restDuration - (now() - startedAt)
      if (-150 < duration && duration <= 50) {
        audio.currentTime = 0
        played = audio.play()
      }
    }

    playSoundOnceDurationReachedZero()
    interval.addEventListener("message", playSoundOnceDurationReachedZero)

    interval.postMessage(["start", 100])

    return () => {
      abort.abort()
    }
  }, [audio, mode, restDuration, startedAt])
}
