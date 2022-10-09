import { useCallback, useRef, useSyncExternalStore } from "react"

export function useTimer(): number {
  const now$ = useRef(Date.now())

  const subscribe = useCallback((onStoreChange: () => void): (() => void) => {
    const timer = setInterval(() => {
      now$.current = Date.now()

      onStoreChange()
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return useSyncExternalStore(subscribe, () => now$.current)
}
