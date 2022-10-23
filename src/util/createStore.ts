import { firstValueFrom, from, ObservableInput } from "rxjs"

export interface Store<T> {
  subscribe(onStoreChange: () => void): () => void
  getSnapshot(): T
}

export function createStore<T>(
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
