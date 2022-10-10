import {
  addDoc,
  CollectionReference,
  DocumentData,
  DocumentReference,
  Firestore,
  serverTimestamp,
  WithFieldValue,
} from "firebase/firestore"
import { useFirestore } from "./useFirestore"

export function useAddDoc<T extends DocumentData>(
  getCollection: (db: Firestore) => CollectionReference<DocumentData>
): (data: WithFieldValue<T>) => Promise<DocumentReference<DocumentData>> {
  const db = useFirestore()

  return (data) =>
    addDoc(getCollection(db), {
      ...data,
      createdAt: serverTimestamp(),
    })
}
