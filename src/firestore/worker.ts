import { expose } from "comlink"
import { initializeApp, type FirebaseOptions } from "firebase/app"
import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
  onSnapshot,
  type DocumentData,
  type Firestore,
} from "firebase/firestore"
import type { Room } from "../zod/roomZod"
import { collection } from "./collection"

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

  onSnapshotRoom(
    roomId: Room["id"],
    onNext: (data: DocumentData | undefined) => void
  ) {
    const reference = doc(collection(this.firestore, "rooms"), roomId)

    onSnapshot(reference, (snapshot) => {
      onNext(snapshot.data({ serverTimestamps: "estimate" }))
    })
  }
}

expose(RemoteFirestore)
