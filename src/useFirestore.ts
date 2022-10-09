import { Firestore } from "firebase/firestore"
import { createContext, useContext } from "react"

const firestoreContext = createContext<Firestore | null>(null)

export const FirestoreProvider = firestoreContext.Provider

export function useFirestore(): Firestore {
  const firestore = useContext(firestoreContext)
  if (!firestore) {
    throw new Error("FirestoreProviderで囲んでいないかvalueがnullです")
  }

  return firestore
}
