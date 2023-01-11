import { expose } from "comlink"
import { initializeApp } from "firebase/app"
import {
  connectFirestoreEmulator,
  Firestore,
  getFirestore,
} from "firebase/firestore"

export class RemoteFirestore {
  firestore: Firestore | undefined

  async init() {
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

    this.firestore = firestore
  }

  snapshot() {
    console.log("snapshot from worker")
  }
}

expose(RemoteFirestore)
