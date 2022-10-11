import { DocumentData, Firestore, Query } from "firebase/firestore"
import { useSyncExternalStore } from "react"
import { createCollectionStore } from "./createCollectionStore"
import { Store } from "./Store"
import { useFirestore } from "./useFirestore"

const storeMap = new Map<string, Store<unknown>>()

export function useCollection<T>(
  key: string,
  getQuery: (db: Firestore) => Query,
  converter: (rawData: DocumentData) => T
): T[] {
  const db = useFirestore()

  let store = storeMap.get(key) as Store<T[]> | undefined
  if (!store) {
    store = createCollectionStore(getQuery(db), converter)

    storeMap.set(key, store)
  }

  return useSyncExternalStore(store.subscribe, store.getOrThrow)
}
