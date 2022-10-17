import { Reducer, useReducer, useSyncExternalStore } from "react"

interface Add {
  <T extends PromiseLike<unknown>>(promise: T): T
}

interface Store {
  subscribe(onStoreChange: () => void): () => void
  getSnapshot(): boolean
}

export function useAllSettled(): [allSettled: boolean, add: Add] {
  const [[, store], dispatch] = useReducer<
    Reducer<[Set<PromiseLike<unknown>>, Store], PromiseLike<unknown>>
  >(
    (state, promise) => {
      const [currentPromises] = state
      if (currentPromises.has(promise)) {
        return state
      }

      let settled = false
      const newPromises = new Set(currentPromises.values()).add(promise)

      return [
        newPromises,
        {
          subscribe(onStoreChange) {
            const abort = new AbortController()

            Promise.allSettled(newPromises).then(() => {
              if (abort.signal.aborted) return

              settled = true
              onStoreChange()
            })

            return () => {
              abort.abort()
            }
          },

          getSnapshot() {
            return settled
          },
        },
      ]
    },
    [
      new Set(),
      {
        subscribe() {
          return () => {}
        },
        getSnapshot() {
          return true
        },
      },
    ]
  )

  const allSettled = useSyncExternalStore(store.subscribe, store.getSnapshot)

  const add: Add = (promise) => {
    dispatch(promise)
    return promise
  }

  return [allSettled, add]
}
