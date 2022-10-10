import { useSyncExternalStore } from "react"

let now = Date.now()

export function useTimer(): number {
  return useSyncExternalStore(subscribe, () => now)
}

function subscribe(onStoreChange: () => void): () => void {
  now = Date.now()

  const timer = setInterval(() => {
    now = Date.now()

    onStoreChange()
  }, 1000)

  return () => {
    clearInterval(timer)
  }
}
