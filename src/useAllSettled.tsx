import { useReducer, useSyncExternalStore } from "react"
import { mapGetOrPut } from "./mapGetOrPut"
import { Store } from "./Store"

const getOrPut = mapGetOrPut(
  new WeakMap<Set<Promise<unknown>>, Store<boolean>>()
)

export function useAllSettled(): [
  allSettled: boolean,
  add: (promise: Promise<unknown>) => void
] {
  const [promises, add] = useReducer(
    (promises: Set<Promise<unknown>>, promise: Promise<unknown>) => {
      if (promises.has(promise)) {
        return promises
      }

      return new Set(promises.values()).add(promise)
    },
    new Set<Promise<unknown>>()
  )

  const store = getOrPut(
    promises,
    () =>
      new Store((onChange) => {
        Promise.allSettled(promises).then(() => {
          onChange(true)
        })
        return () => {}
      })
  )

  const allSettled = useSyncExternalStore(store.subscribe, store.get)

  return [typeof allSettled === "boolean" ? allSettled : false, add]
}
