import { useSyncExternalStore } from "react"

let now = Date.now()

export function useTimer(base: number): number {
  return useSyncExternalStore(subscribe, () => {
    const delta = now - base
    return delta - (delta % 1_000)
  })
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
