import type { Firestore } from "firebase/firestore"
import { createContext } from "../createContext"

export const [keyWithFirestore, useFirestore] =
  createContext<Firestore>("Firestore")
