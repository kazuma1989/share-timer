import {
  serverTimestamp as firestoreServerTimestamp,
  type FieldValue,
} from "firebase/firestore"

interface Meta {
  createdAt: FieldValue
}

export function withMeta<T>(docData: T): T & Meta {
  return {
    ...docData,
    createdAt: firestoreServerTimestamp(),
  }
}
