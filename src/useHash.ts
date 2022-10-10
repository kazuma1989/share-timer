import { useSyncExternalStore } from "react"

export function useHash(): string {
  return useSyncExternalStore(subscribe, () => window.location.hash)
}

function subscribe(onStoreChange: () => void): () => void {
  const abort = new AbortController()

  window.addEventListener("hashchange", onStoreChange, {
    passive: true,
    signal: abort.signal,
  })

  return () => {
    abort.abort()
  }
}
