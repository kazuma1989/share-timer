import {
  DocumentData,
  DocumentReference,
  Firestore,
  onSnapshot,
  refEqual,
} from "firebase/firestore"
import { useCallback, useRef, useSyncExternalStore } from "react"
import { useFirestore } from "./useFirestore"

export function useDoc<T>(
  getRef: (db: Firestore) => DocumentReference,
  converter: (rawData: DocumentData) => T
): T | undefined {
  const data$ = useRef<T>()

  const converter$ = useRef(converter)
  converter$.current = converter

  const db = useFirestore()

  let ref = getRef(db)
  const prevRef$ = useRef(ref)
  if (refEqual(ref, prevRef$.current)) {
    ref = prevRef$.current
  } else {
    prevRef$.current = ref
  }

  const subscribe = useCallback(
    (onStoreChange: () => void): (() => void) =>
      onSnapshot(ref, (doc) => {
        const rawData = doc.data()
        if (rawData) {
          data$.current = converter$.current(rawData)
        }

        onStoreChange()
      }),
    [ref]
  )

  return useSyncExternalStore(subscribe, () => data$.current)
}
