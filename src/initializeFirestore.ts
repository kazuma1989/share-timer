import { initializeApp } from "firebase/app"
import {
  connectFirestoreEmulator,
  Firestore,
  getFirestore,
} from "firebase/firestore"

export async function initializeFirestore(): Promise<Firestore> {
  const firebaseApp = initializeApp(
    await fetch("/__/firebase/init.json").then((_) => _.json())
  )

  const firestore = getFirestore(firebaseApp)

  if (import.meta.env.VITE_FIRESTORE_EMULATOR) {
    const host = location.hostname
    const port = Number(location.port)
    console.info(`using emulator (${host}:${port})`)

    connectFirestoreEmulator(firestore, host, port)
  }

  return firestore
}
