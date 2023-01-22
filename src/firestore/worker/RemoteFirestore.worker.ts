import { expose, proxy, type ProxyMarked } from "comlink"
import { initializeApp, type FirebaseOptions } from "firebase/app"
import {
  connectAuthEmulator,
  getAuth,
  signInAnonymously,
  type Auth,
} from "firebase/auth"
import {
  addDoc,
  connectFirestoreEmulator,
  doc,
  getDocFromServer,
  getDocs,
  getFirestore,
  limitToLast,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp as firestoreServerTimestamp,
  setDoc,
  startAt,
  Timestamp,
  type FieldValue,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore"
import * as s from "superstruct"
import {
  actionSchema,
  coerceTimestamp,
  type Action,
  type ActionInput,
} from "../../schema/actionSchema"
import {
  roomSchema,
  type InvalidDoc,
  type Room,
  type RoomInput,
} from "../../schema/roomSchema"
import { timerReducer, type TimerState } from "../../schema/timerReducer"
import { serverTimestamp } from "../../serverTimestamp"
import { setTransferHandlers } from "../../setTransferHandlers"
import { AbortReason } from "../../useLockRoom"
import { calibrationSchema, type Calibration } from "./calibrationSchema"
import { collection } from "./collection"
import { hasNoEstimateTimestamp } from "./hasNoEstimateTimestamp"
import { orderBy } from "./orderBy"
import { where } from "./where"
import { withMeta } from "./withMeta"

export class RemoteFirestore {
  readonly auth: Auth

  readonly firestore: Firestore

  constructor(options: FirebaseOptions) {
    const firebaseApp = initializeApp(options)

    this.auth = getAuth(firebaseApp)

    // TODO VITE_FIRESTORE_EMULATOR を間借りするのではなく専用の定数を用意するべき
    if (import.meta.env.VITE_FIRESTORE_EMULATOR) {
      const protocol = location.protocol
      const host = location.hostname

      connectAuthEmulator(this.auth, `${protocol}//${host}:9099`)
    }

    this.firestore = getFirestore(firebaseApp)

    if (import.meta.env.VITE_FIRESTORE_EMULATOR) {
      const host = location.hostname
      const port = Number(location.port)
      console.info(`using emulator (${host}:${port})`)

      connectFirestoreEmulator(this.firestore, host, port)
    }

    setTransferHandlers()
  }

  async signIn(): Promise<void> {
    const x = await signInAnonymously(this.auth)
    console.log(x.user)
  }

  onSnapshotRoom(
    roomId: Room["id"],
    onNext: ((data: Room | InvalidDoc) => void) & ProxyMarked
  ): Unsubscribe & ProxyMarked {
    const referenceRoom = doc(collection(this.firestore, "rooms"), roomId)

    const unsubscribe = onSnapshot(referenceRoom, (snapshot) => {
      const rawData = snapshot.data({
        serverTimestamps: "estimate",
      })

      const [error, data] = s.validate(rawData, roomSchema)
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
  ): Promise<Unsubscribe & ProxyMarked> {
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

        const [error, data] = s.validate(rawData, actionSchema)
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
      new URL("../../emoji/Animals & Nature.json", import.meta.url)
    ).then<typeof import("../../emoji/Animals & Nature.json")>((_) => _.json())
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
    } & ProxyMarked
  ): Promise<void> {
    const { aborted, onBeforeUpdate } = options ?? {}

    await runTransaction(
      this.firestore,
      async (transaction) => {
        const roomDoc = await transaction.get(
          doc(collection(this.firestore, "rooms"), roomId)
        )
        if (await aborted?.()) {
          throw AbortReason("signal")
        }

        if (!roomDoc.exists()) {
          throw AbortReason("room-not-exists")
        }

        const room = s.create(roomDoc.data(), roomSchema)
        if (room.lockedBy) {
          throw AbortReason("already-locked")
        }

        await onBeforeUpdate?.()
        if (await aborted?.()) {
          throw AbortReason("signal")
        }

        transaction.update(roomDoc.ref, {
          lockedBy,
        } satisfies RoomInput)
      },
      {
        maxAttempts: 1,
      }
    )
  }

  /**
   * serverTimestamp() - Timestamp.now()
   */
  async getEstimatedDiff(): Promise<number> {
    // eslint-disable-next-line no-restricted-globals
    const _now = Date.now()

    const clientDoc = doc(collection(this.firestore, "calibrations"))
    await setDoc(
      clientDoc,
      withMeta({
        clientTime: Timestamp.fromMillis(_now),
        serverTime: firestoreServerTimestamp() as Timestamp,
      } satisfies Calibration)
    )

    const serverDoc = await getDocFromServer(clientDoc)
    const { clientTime, serverTime } = s.create(
      serverDoc.data(),
      calibrationSchema
    )

    return serverTime.toMillis() - clientTime.toMillis()
  }
}

if (!import.meta.vitest) {
  expose(RemoteFirestore)
}

const DEFAULT_DURATION = 3 * 60000

function convertServerTimestamp<T extends Record<string, unknown>>(
  value: T
): { [P in keyof T]: T[P] extends typeof serverTimestamp ? FieldValue : T[P] } {
  return Object.fromEntries(
    Object.entries(value).map(([key, value]) => [
      key,
      value === serverTimestamp ? firestoreServerTimestamp() : value,
    ])
  ) as any
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("isSerializedSymbol", async () => {
    const { FieldValue } = await import("firebase/firestore")

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
