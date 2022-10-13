import { Reducer, useReducer, useSyncExternalStore } from "react"
import { mapGetOrPut } from "./mapGetOrPut"
import { Store } from "./Store"

export function useAllSettled(): [
  allSettled: boolean,
  add: <T extends PromiseLike<unknown>>(promise: T) => T
] {
  const [promises, dispatch] = useReducer<
    Reducer<Set<PromiseLike<unknown>>, PromiseLike<unknown>>
  >((promises, promise) => {
    if (promises.has(promise)) {
      return promises
    }

    return new Set(promises.values()).add(promise)
  }, new Set())

  const store = getOrPut(
    promises,
    () =>
      new Store((onChange) => {
        Promise.allSettled(promises).then(() => {
          promises.clear()
          onChange(true)
        })
        return () => {}
      })
  )

  const allSettled = useSyncExternalStore(store.subscribe, store.get)
  const add: <T extends PromiseLike<unknown>>(promise: T) => T = (promise) => {
    dispatch(promise)
    return promise
  }

  return [typeof allSettled === "boolean" ? allSettled : false, add]
}

const getOrPut = mapGetOrPut(
  new WeakMap<Set<PromiseLike<unknown>>, Store<boolean>>()
)
