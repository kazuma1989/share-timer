import { Firestore } from "firebase/firestore"
import { createContext } from "./createContext"

const [FirestoreProvider, useFirestore] =
  createContext<Firestore>("FirestoreProvider")

export { FirestoreProvider, useFirestore }
