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
  getQuery: (db: Firestore) => Query<DocumentData>,
  converter: (rawData: DocumentData) => T | undefined
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
        data$.current = doc.docs
          .map((doc) =>
            converter$.current(
              doc.data({
                serverTimestamps: "estimate",
              })
            )
          )
          .filter((_: T | undefined): _ is T => _ !== undefined)

        onStoreChange()
      }),
    [query]
  )

  return useSyncExternalStore(subscribe, () => data$.current)
}
