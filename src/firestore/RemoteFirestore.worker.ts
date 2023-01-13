import { expose, proxy, type ProxyMarked } from "comlink"
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
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore"
import { setTransferHandlers } from "../setTransferHandlers"
import { timerReducer, type TimerState } from "../timerReducer"
import { actionZod, type Action, type ActionInput } from "../zod/actionZod"
import {
  roomZod,
  type InvalidDoc,
  type Room,
  type RoomInput,
} from "../zod/roomZod"
import { toFirestore } from "./actionZodImpl"
import { collection } from "./collection"
import { hasNoEstimateTimestamp } from "./hasNoEstimateTimestamp"
import { orderBy } from "./orderBy"
import { where } from "./where"
import { withMeta } from "./withMeta"

setTransferHandlers()

export class RemoteFirestore {
  readonly firestore: Firestore

  log(x: symbol): void {
    console.log(x, x === Symbol.for("serverTimestamp"))
  }

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
    onNext: ((data: Room | InvalidDoc) => void) & ProxyMarked
  ): Unsubscribe {
    const referenceRoom = doc(collection(this.firestore, "rooms"), roomId)

    const unsubscribe = onSnapshot(referenceRoom, (snapshot) => {
      const rawData = snapshot.data({
        serverTimestamps: "estimate",
      })

      const _ = roomZod.safeParse(rawData)
      if (!_.success) {
        if (rawData) {
          console.debug(rawData, _.error)
        }

        onNext(["invalid-doc", roomId])
      } else {
        onNext({
          ..._.data,
          id: roomId,
        })
      }
    })

    return proxy(unsubscribe)
  }

  async onSnapshotTimerState(
    roomId: Room["id"],
    onNext: ((data: TimerState) => void) & ProxyMarked
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
      const actions = snapshot.docs.flatMap((doc): Action[] => {
        const rawData = doc.data({
          serverTimestamps: "estimate",
        })

        const _ = actionZod.safeParse(rawData)
        return _.success ? [_.data] : []
      })

      onNext(
        actions.reduce(timerReducer, {
          mode: "editing",
          initialDuration: 0,
        })
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
    aborted: (() => PromiseLike<boolean> | boolean) & ProxyMarked
  ): Promise<void> {
    const emoji = await fetch(
      new URL("../emoji/Animals & Nature.json", import.meta.url)
    ).then<typeof import("../emoji/Animals & Nature.json")>((_) => _.json())
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

  async lockRoom(
    roomId: Room["id"],
    lockedBy: string,
    options?: {
      aborted?: () => boolean | PromiseLike<boolean>
      onBeforeUpdate?: () => void | PromiseLike<void>
    }
  ): Promise<void> {
    // TODO 本物の実装
    console.log(roomId, lockedBy, options)
  }
}

expose(RemoteFirestore)

const DEFAULT_DURATION = 3 * 60000
