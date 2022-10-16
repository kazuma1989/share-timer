import { FieldValue, serverTimestamp } from "firebase/firestore"

interface Meta {
  createdAt: FieldValue
}

export function withMeta<T>(docData: T): T & Meta {
  return {
    ...docData,
    createdAt: serverTimestamp(),
  }
}
