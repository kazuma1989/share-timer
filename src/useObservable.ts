import { useSyncExternalStore } from "react"
import { firstValueFrom, from, ObservableInput } from "rxjs"
import { mapGetOrPut } from "./util/mapGetOrPut"

export function useObservable<T>(
  source: ObservableInput<T>,
  initialValue?: T
): T {
  const store = getOrPut(source, () => createStore(source, initialValue))

  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}

const getOrPut = mapGetOrPut()

interface Store<T> {
  subscribe(onStoreChange: () => void): () => void
  getSnapshot(): T
}

function createStore<T>(
  source: ObservableInput<T>,
  initialValue?: T
): Store<T> {
  const Empty = Symbol("empty")
  type Empty = typeof Empty

  // initialValueにundefinedを指定できないけどまあいいか
  let currentValue: T | Empty =
    initialValue !== undefined ? initialValue : Empty

  const observable = from(source)

  return {
    subscribe(onStoreChange) {
      const subscription = observable.subscribe((value) => {
        currentValue = value
        onStoreChange()
      })

      return () => {
        subscription.unsubscribe()
      }
    },

    getSnapshot() {
      if (currentValue !== Empty) {
        return currentValue
      }

      throw firstValueFrom(observable).then((value) => {
        currentValue = value
      })
    },
  }
}
