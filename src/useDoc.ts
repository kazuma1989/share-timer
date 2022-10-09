import { doc, DocumentData, onSnapshot } from "firebase/firestore"
import { useCallback, useRef, useSyncExternalStore } from "react"
import { useFirestore } from "./useFirestore"

export function useDoc<T>(
  path: [string, ...string[]],
  converter: (rawData: DocumentData) => T
): T | undefined {
  const data$ = useRef<T>()

  const db = useFirestore()

  const converter$ = useRef(converter)
  converter$.current = converter

  const pathString = JSON.stringify(path)

  const subscribe = useCallback(
    (onStoreChange: () => void): (() => void) =>
      onSnapshot(doc(db, ...(JSON.parse(pathString) as typeof path)), (doc) => {
        const rawData = doc.data()
        if (rawData) {
          data$.current = converter$.current(rawData)
        }

        onStoreChange()
      }),
    [db, pathString]
  )

  return useSyncExternalStore(subscribe, () => data$.current)
}
