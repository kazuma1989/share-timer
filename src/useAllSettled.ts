import { Reducer, useReducer, useSyncExternalStore } from "react"
import { createStore, Store } from "./createStore"

interface Add {
  <T extends PromiseLike<unknown>>(promise: T): T
}

export function useAllSettled(): [allSettled: boolean, add: Add] {
  const [[, store], dispatch] = useReducer<
    Reducer<[Set<PromiseLike<unknown>>, Store<boolean>], PromiseLike<unknown>>
  >(
    (state, promise) => {
      const [currentPromises] = state
      if (currentPromises.has(promise)) {
        return state
      }

      const newPromises = new Set(currentPromises.values()).add(promise)
      return [
        newPromises,
        createStore(
          Promise.allSettled(newPromises).then(() => {
            newPromises.clear()
            return true
          }),
          false
        ),
      ]
    },
    [new Set(), createStore(Promise.resolve(true), true)]
  )

  const allSettled = useSyncExternalStore(store.subscribe, store.getSnapshot)

  const add: Add = (promise) => {
    dispatch(promise)
    return promise
  }

  return [allSettled, add]
}
