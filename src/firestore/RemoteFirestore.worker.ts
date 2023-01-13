import { expose, proxy, type ProxyMarked } from "comlink"
import { initializeApp, type FirebaseOptions } from "firebase/app"
import {
  addDoc,
  connectFirestoreEmulator,
  doc,
  FieldValue,
  getDocs,
  getFirestore,
  limitToLast,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp as firestoreServerTimestamp,
  startAt,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore"
import * as s from "superstruct"
import { setTransferHandlers } from "../setTransferHandlers"
import { timerReducer, type TimerState } from "../timerReducer"
import { serverTimestamp } from "../util/ServerTimestamp"
import {
  actionZod,
  coerceTimestamp,
  type Action,
  type ActionInput,
} from "../zod/actionZod"
import {
  roomZod,
  type InvalidDoc,
  type Room,
  type RoomInput,
} from "../zod/roomZod"
import { collection } from "./collection"
import { hasNoEstimateTimestamp } from "./hasNoEstimateTimestamp"
import { orderBy } from "./orderBy"
import { where } from "./where"
import { withMeta } from "./withMeta"

setTransferHandlers()

export class RemoteFirestore {
  readonly firestore: Firestore

  log(x: unknown): void {
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

      const [error, data] = s.validate(rawData, roomZod)
      if (error) {
        if (rawData) {
          console.warn(rawData, error)
        }

        onNext(["invalid-doc", roomId])
      } else {
        onNext({
          ...data,
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

        const [error, data] = s.validate(rawData, actionZod)
        if (error) {
          console.debug(rawData, error)
          return []
        }

        return [coerceTimestamp(data)]
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
      withMeta(convertServerTimestamp(action))
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

if (!import.meta.vitest) {
  expose(RemoteFirestore)
}

const DEFAULT_DURATION = 3 * 60000

function convertServerTimestamp<T extends Record<string, unknown>>(
  value: T
): Record<keyof T, Exclude<T[keyof T], typeof serverTimestamp> | FieldValue> {
  return Object.fromEntries(
    Object.entries(value).map(([key, value]) => [
      key,
      value === serverTimestamp ? firestoreServerTimestamp() : value,
    ])
  ) as any
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("isSerializedSymbol", () => {
    const x = convertServerTimestamp({
      a: "A",
      b: serverTimestamp,
    })

    expect(x).toMatchObject({
      a: "A",
      b: expect.any(FieldValue),
    } satisfies typeof x)
  })
}
