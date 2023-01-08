import type { Firestore } from "firebase/firestore"
import { getContext } from "svelte"

export function useFirestore(): Firestore {
  return getContext<Firestore>(key)
}

export function keyWithFirestore(
  firestore: Firestore
): [typeof key, Firestore] {
  return [key, firestore]
}

const key = Symbol()
