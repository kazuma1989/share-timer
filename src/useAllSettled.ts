import { Reducer, useReducer, useSyncExternalStore } from "react"

interface Add {
  <T extends PromiseLike<unknown>>(promise: T): T
}

interface Store<T> {
  subscribe(onStoreChange: () => void): () => void
  getSnapshot(): T
}

function createStore<T>(promise: PromiseLike<T>, initialValue?: T): Store<T> {
  const Empty = Symbol("empty")
  type Empty = typeof Empty

  // initialValueにundefinedを指定できないけどまあいいか
  let currentValue: T | Empty = initialValue ?? Empty

  return {
    subscribe(onStoreChange) {
      const abort = new AbortController()

      promise.then((value) => {
        if (abort.signal.aborted) return

        currentValue = value
        onStoreChange()
      })

      return () => {
        abort.abort()
      }
    },

    getSnapshot() {
      if (currentValue !== Empty) {
        return currentValue
      }

      throw promise.then((value) => {
        currentValue = value
      })
    },
  }
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
