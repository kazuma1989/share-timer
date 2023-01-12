import { expose, proxy } from "comlink"
import { initializeApp, type FirebaseOptions } from "firebase/app"
import {
  addDoc,
  connectFirestoreEmulator,
  doc,
  getDocs,
  getFirestore,
  limitToLast,
  onSnapshot,
  query,
  runTransaction,
  startAt,
  type DocumentData,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore"
import type { ActionInput } from "../zod/actionZod"
import type { Room, RoomInput } from "../zod/roomZod"
import { toFirestore } from "./actionZodImpl"
import { collection } from "./collection"
import { hasNoEstimateTimestamp } from "./hasNoEstimateTimestamp"
import { orderBy } from "./orderBy"
import { where } from "./where"
import { withMeta } from "./withMeta"

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

  async dispatch(roomId: Room["id"], action: ActionInput): Promise<void> {
    await addDoc(
      collection(this.firestore, "rooms", roomId, "actions"),
      withMeta(toFirestore.parse(action))
    )
  }

  async setupRoom(
    roomId: string,
    aborted: () => PromiseLike<boolean> | boolean
  ): Promise<void> {
    const emoji = await import("../emoji/Animals & Nature.json").then(
      (_) => _.default
    )
    if (await aborted()) throw "aborted 1"

    const e = emoji[(Math.random() * emoji.length) | 0]!
    const roomName = `${e.value} ${e.name}`

    await runTransaction(
      this.firestore,
      async (transaction) => {
        const roomDoc = await transaction.get(
          doc(collection(this.firestore, "rooms"), roomId)
        )
        if (await aborted()) throw "aborted 2"

        if (roomDoc.exists()) {
          transaction.update(roomDoc.ref, {
            name: roomName,
          } satisfies RoomInput)
        } else {
          transaction.set(
            roomDoc.ref,
            withMeta({
              name: roomName,
            } satisfies RoomInput)
          )
        }

        transaction.set(
          doc(collection(this.firestore, "rooms", roomId, "actions")),
          withMeta({
            type: "cancel",
            withDuration: DEFAULT_DURATION,
          } satisfies ActionInput)
        )
      },
      {
        maxAttempts: 1,
      }
    )
  }
}

expose(RemoteFirestore)

const DEFAULT_DURATION = 3 * 60000
