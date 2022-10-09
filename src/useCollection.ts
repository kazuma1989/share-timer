import { collection, DocumentData, onSnapshot } from "firebase/firestore"
import { useCallback, useRef, useSyncExternalStore } from "react"
import { useFirestore } from "./useFirestore"

export function useCollection<T>(
  path: [string, ...string[]],
  converter: (rawData: DocumentData) => T
): T[] {
  const data$ = useRef<T[]>([])

  const db = useFirestore()

  const converter$ = useRef(converter)
  converter$.current = converter

  const pathString = JSON.stringify(path)

  const subscribe = useCallback(
    (onStoreChange: () => void): (() => void) =>
      onSnapshot(
        collection(db, ...(JSON.parse(pathString) as typeof path)),
        (doc) => {
          data$.current = doc.docs.map((doc) => converter$.current(doc.data()))

          onStoreChange()
        }
      ),
    [db, pathString]
  )

  return useSyncExternalStore(subscribe, () => data$.current)
}
