import {
  collection as _collection,
  CollectionReference,
  Firestore,
} from "firebase/firestore"

export function collection(
  db: Firestore,
  ...path: ["rooms"] | ["rooms", string, "actions"]
): CollectionReference {
  return _collection(db, ...(path as [string, ...string[]]))
}
