import { Reducer, useReducer, useSyncExternalStore } from "react"
import { mapGetOrPut } from "./mapGetOrPut"
import { Store } from "./Store"

interface Add {
  <T extends PromiseLike<unknown>>(promise: T): T
}

export function useAllSettled(): [allSettled: boolean, add: Add] {
  const [promises, dispatch] = useReducer<
    Reducer<Set<PromiseLike<unknown>>, PromiseLike<unknown>>
  >((promises, promise) => {
    if (promises.has(promise)) {
      return promises
    }

    return new Set(promises.values()).add(promise)
  }, new Set())

  const store = getOrPut(promises, () =>
    Store.from(
      Promise.allSettled(promises).then((): typeof Settled => {
        promises.clear()
        return Settled
      })
    )
  )

  const allSettled =
    useSyncExternalStore(store.subscribe, store.getValue) === Settled

  const add: Add = (promise) => {
    dispatch(promise)
    return promise
  }

  return [allSettled, add]
}

const Settled = Symbol("settled")

const getOrPut = mapGetOrPut(
  new WeakMap<Set<PromiseLike<unknown>>, Store<typeof Settled>>()
)
