import { useSyncExternalStore } from "react"
import { firstValueFrom, from, ObservableInput } from "rxjs"
import { mapGetOrPut } from "./mapGetOrPut"

export interface Store<T> {
  subscribe(onStoreChange: () => void): () => void
  getSnapshot(): T
}

export function createStore<T>(
  input: ObservableInput<T>,
  initialValue?: T
): Store<T> {
  const Empty = Symbol("empty")
  type Empty = typeof Empty

  // initialValueにundefinedを指定できないけどまあいいか
  let currentValue: T | Empty =
    initialValue !== undefined ? initialValue : Empty

  const observable = from(input)

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

export function useObservable<T>(source: ObservableInput<T>): T {
  // Map の値を作るのが createStore(source) しかないため、戻り値は Store<T> で OK
  const store = getOrPut(source, () => createStore(source)) as Store<T>

  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}

const getOrPut = mapGetOrPut(
  new WeakMap<ObservableInput<unknown>, Store<unknown>>()
)
