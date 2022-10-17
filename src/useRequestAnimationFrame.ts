import { useSyncExternalStore } from "react"
import { now } from "./now"

export function useRequestAnimationFrame<T>(
  getSnapshot: (now: number) => T
): T {
  return useSyncExternalStore(subscribe, () => getSnapshot(_now))
}

let _now = now()

function subscribe(next: () => void): () => void {
  const abort = new AbortController()

  const tick = () => {
    if (abort.signal.aborted) return

    requestAnimationFrame(tick)

    _now = now()
    next()
  }

  tick()

  return () => {
    abort.abort()
  }
}
