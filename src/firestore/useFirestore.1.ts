import type { Firestore } from "firebase/firestore"
import { createContext } from "../createContext.1"

export const [keyWithFirestore, useFirestore] =
  createContext<Firestore>("useSetup")
