import { expose } from "comlink"
import { initializeApp, type FirebaseOptions } from "firebase/app"
import {
  connectFirestoreEmulator,
  Firestore,
  getFirestore,
} from "firebase/firestore"

export class RemoteFirestore {
  readonly firestore: Firestore

  constructor(options: FirebaseOptions) {
    const firebaseApp = initializeApp(options)

    const firestore = getFirestore(firebaseApp)

    if (import.meta.env.VITE_FIRESTORE_EMULATOR) {
      const host = location.hostname
      const port = Number(location.port)
      console.info(`using emulator (${host}:${port})`)

      connectFirestoreEmulator(firestore, host, port)
    }

    this.firestore = firestore
  }

  log() {
    console.log(this.firestore)
  }

  snapshot() {
    console.log("snapshot from worker")
  }
}

expose(RemoteFirestore)
