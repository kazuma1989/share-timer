import { DocumentData, onSnapshot, Query } from "firebase/firestore"
import { Store } from "./Store"

export function createCollectionStore<T>(
  query: Query,
  converter: (rawData: DocumentData) => T
): Store<T[]> {
  return new Store((onChange) =>
    onSnapshot(query, (doc) => {
      const data = doc.docs.flatMap<T>((doc) => {
        const data = doc.data({
          serverTimestamps: "estimate",
        })

        try {
          return [converter(data)]
        } catch (error) {
          console.debug(data, error)
          return []
        }
      })

      onChange(data)
    })
  )
}
