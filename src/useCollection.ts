import {
  DocumentData,
  Firestore,
  onSnapshot,
  Query,
  queryEqual,
} from "firebase/firestore"
import { useCallback, useRef, useSyncExternalStore } from "react"
import { useFirestore } from "./useFirestore"

export function useCollection<T>(
  getQuery: (db: Firestore) => Query,
  converter: (rawData: DocumentData) => T
): T[] | undefined {
  const data$ = useRef<T[]>()

  const converter$ = useRef(converter)
  converter$.current = converter

  const db = useFirestore()

  let query = getQuery(db)
  const prevQuery$ = useRef(query)
  if (queryEqual(query, prevQuery$.current)) {
    query = prevQuery$.current
  } else {
    prevQuery$.current = query
  }

  const subscribe = useCallback(
    (onStoreChange: () => void): (() => void) =>
      onSnapshot(query, (doc) => {
        data$.current = doc.docs.flatMap<T>((doc) => {
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

        onStoreChange()
      }),
    [query]
  )

  return useSyncExternalStore(subscribe, () => data$.current)
}
