import type { Firestore } from "firebase/firestore"
import { createContext } from "../createContext"

export const [FirestoreProvider, useFirestore] =
  createContext<Firestore>("FirestoreProvider")
