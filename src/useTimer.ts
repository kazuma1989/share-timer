import { useSyncExternalStore } from "react"

let now = Date.now()

export function useTimer(): number {
  return useSyncExternalStore(subscribe, () => now)
}

function subscribe(onStoreChange: () => void): () => void {
  const abort = new AbortController()

  const tick = () => {
    if (abort.signal.aborted) return

    requestAnimationFrame(tick)

    now = Date.now()
    onStoreChange()
  }

  tick()

  return () => {
    abort.abort()
  }
}
