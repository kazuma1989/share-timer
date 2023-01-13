import {
  FieldValue,
  serverTimestamp as firestoreServerTimestamp,
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
