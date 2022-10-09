import { useCallback, useRef, useSyncExternalStore } from "react"

export function useTimer(paused = false): number {
  const now$ = useRef(Date.now())

  const subscribe = useCallback(
    (onStoreChange: () => void): (() => void) => {
      if (paused) {
        return () => {}
      }

      now$.current = Date.now()

      const timer = setInterval(() => {
        now$.current = Date.now()

        onStoreChange()
      }, 1000)

      return () => {
        clearInterval(timer)
      }
    },
    [paused]
  )

  return useSyncExternalStore(subscribe, () => now$.current)
}
