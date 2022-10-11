import { useSyncExternalStore } from "react"
import { Store } from "./Store"

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.getOrThrow)
}
