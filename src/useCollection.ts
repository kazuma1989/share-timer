import {
  DocumentData,
  Firestore,
  onSnapshot,
  Query,
  queryEqual,
} from "firebase/firestore"
import { useRef, useSyncExternalStore } from "react"
import { useFirestore } from "./useFirestore"

export function useCollection<T>(
  getQuery: (db: Firestore) => Query,
  converter: (rawData: DocumentData) => T
): T[] {
  const converter$ = useRef(converter)
  converter$.current = converter

  const db = useFirestore()
  const query = getQuery(db)

  if (!queryMap.has(query)) {
    queryMap.set(
      query,
      new Store<T[]>((onChange) =>
        onSnapshot(query, (doc) => {
          const data = doc.docs.flatMap<T>((doc) => {
            const data = doc.data({
              serverTimestamps: "estimate",
            })

            try {
              return [converter$.current(data)]
            } catch (error) {
              console.debug(data, error)
              return []
            }
          })

          onChange(data)
        })
      )
    )
  }

  const store = queryMap.get(query)! as Store<T[]>

  return useSyncExternalStore(store.subscribe, store.getOrThrow)
}

class Store<V> {
  private latestValue?: V

  private unsubscribe: () => void

  private onStoreChange?: () => void

  constructor(init: (onChange: (value: V) => void) => () => void) {
    this.unsubscribe = init((value) => {
      this.latestValue = value
      this.onStoreChange?.()
    })
  }

  subscribe = (onStoreChange: () => void): (() => void) => {
    this.onStoreChange = onStoreChange

    // FIXME this.unsubscribeを返すとすぐ購読が止まってしまうのはなぜなのだ。Suspenseによってコンポーネントが破棄される？からか？
    // return this.unsubscribe
    return () => {}
  }

  getOrThrow = (): V => {
    if (this.latestValue) {
      return this.latestValue
    }

    throw new Promise((resolve) => {
      setTimeout(resolve, 1_000)
    })
  }
}

class QueryMap implements WeakMap<Query, Store<unknown>> {
  private internal = new Set<[Query, Store<unknown>]>()

  delete(key: Query): boolean {
    let foundEntry: [Query, Store<unknown>] | undefined
    this.internal.forEach((entry) => {
      if (queryEqual(entry[0], key)) {
        foundEntry = entry
      }
    })

    if (!foundEntry) {
      return false
    }

    return this.internal.delete(foundEntry)
  }

  get(key: Query): Store<unknown> | undefined {
    let value: Store<unknown> | undefined
    this.internal.forEach((entry) => {
      if (queryEqual(entry[0], key)) {
        value = entry[1]
      }
    })

    return value
  }

  has(key: Query): boolean {
    let found = false
    this.internal.forEach((entry) => {
      if (queryEqual(entry[0], key)) {
        found = true
      }
    })

    return found
  }

  set(key: Query, value: Store<unknown>): this {
    let found = false
    this.internal.forEach((entry) => {
      if (queryEqual(entry[0], key)) {
        found = true
        entry[1] = value
      }
    })

    if (!found) {
      this.internal.add([key, value])
    }

    return this
  }

  [Symbol.toStringTag] = "QueryMap"
}

const queryMap = new QueryMap()
