import { useSyncExternalStore } from "react"
import { ObservableInput } from "rxjs"
import { createStore, Store } from "./util/createStore"
import { mapGetOrPut } from "./util/mapGetOrPut"

export function useObservable<T>(
  source: ObservableInput<T>,
  initialValue?: T
): T {
  // Map の値を作るのが createStore(source) しかないため、戻り値は Store<T> で OK
  const store = getOrPut(source, () =>
    createStore(source, initialValue)
  ) as Store<T>

  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}

const getOrPut = mapGetOrPut(
  new WeakMap<ObservableInput<unknown>, Store<unknown>>()
)
