import { expose, proxy } from "comlink"
import { initializeApp, type FirebaseOptions } from "firebase/app"
import {
  connectFirestoreEmulator,
  doc,
  getDocs,
  getFirestore,
  limitToLast,
  onSnapshot,
  query,
  startAt,
  type DocumentData,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore"
import type { Room } from "../zod/roomZod"
import { collection } from "./collection"
import { hasNoEstimateTimestamp } from "./hasNoEstimateTimestamp"
import { orderBy } from "./orderBy"
import { where } from "./where"

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
  ): Unsubscribe {
    const referenceRoom = doc(collection(this.firestore, "rooms"), roomId)

    const unsubscribe = onSnapshot(referenceRoom, (snapshot) => {
      onNext(snapshot.data({ serverTimestamps: "estimate" }))
    })

    return proxy(unsubscribe)
  }

  async onSnapshotTimerState(
    roomId: Room["id"],
    onNext: (data: DocumentData[]) => void
  ): Promise<Unsubscribe> {
    const selectActions = await getDocs(
      query(
        collection(this.firestore, "rooms", roomId, "actions"),
        where("type", "==", "start"),
        orderBy("createdAt", "asc"),
        limitToLast(1)
      )
    ).then(({ docs: [doc] }) =>
      query(
        collection(this.firestore, "rooms", roomId, "actions"),
        orderBy("createdAt", "asc"),
        ...(hasNoEstimateTimestamp(doc?.metadata) ? [startAt(doc)] : [])
      )
    )

    const unsubscribe = onSnapshot(selectActions, (snapshot) => {
      onNext(
        snapshot.docs.map((doc) => doc.data({ serverTimestamps: "estimate" }))
      )
    })

    return proxy(unsubscribe)
  }
}

expose(RemoteFirestore)
