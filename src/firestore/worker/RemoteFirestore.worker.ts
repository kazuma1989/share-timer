import { expose, proxy, type ProxyMarked } from "comlink"
import { initializeApp, type FirebaseOptions } from "firebase/app"
import {
  connectAuthEmulator,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth"
import {
  addDoc,
  connectFirestoreEmulator,
  doc,
  getDoc,
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
  type CollectionReference,
  type DocumentReference,
  type FieldValue,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore"
import {
  distinctUntilChanged,
  map,
  of,
  switchMap,
  takeWhile,
  type Observable,
} from "rxjs"
import * as s from "superstruct"
import {
  actionSchema,
  coerceTimestamp,
  type Action,
  type ActionInput,
} from "../../schema/actionSchema"
import {
  detectMode,
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
import { mapToRoom } from "./mapToRoom"
import { orderBy } from "./orderBy"
import { snapshotOf } from "./snapshotOf"
import { where } from "./where"
import { withMeta } from "./withMeta"

export class RemoteFirestore {
  private readonly firestore: Firestore

  constructor(options: FirebaseOptions) {
    this.firestore = getFirestore(initializeApp(options))

    if (import.meta.env.VITE_FIRESTORE_EMULATOR) {
      const host = location.hostname
      const port = import.meta.env.FIREBASE_EMULATORS.firestore.port
      console.info(`using emulator (${host}:${port})`)

      connectFirestoreEmulator(this.firestore, host, port)
    }

    setTransferHandlers()

    const auth = initializeAuth(this.firestore.app, {
      persistence: indexedDBLocalPersistence,
      // No popupRedirectResolver defined
    })

    if (import.meta.env.VITE_AUTH_EMULATOR) {
      const protocol = location.protocol
      const host = location.hostname
      const port = import.meta.env.FIREBASE_EMULATORS.auth.port

      connectAuthEmulator(auth, `${protocol}//${host}:${port}`)
    }
  }

  private async selectRoom(roomId: Room["id"]): Promise<DocumentReference> {
    if (detectMode(roomId) === "public") {
      return doc(collection(this.firestore, "rooms"), roomId)
    }

    const x = await getDoc(
      doc(collection(this.firestore, "room-owners"), roomId)
    )

    return doc(
      collection(this.firestore, "owners", x.get("owner"), "rooms"),
      roomId
    )
  }

  private async selectActions(
    roomId: Room["id"]
  ): Promise<CollectionReference> {
    if (detectMode(roomId) === "public") {
      return collection(this.firestore, "rooms", roomId, "actions")
    }

    const x = await getDoc(
      doc(collection(this.firestore, "room-owners"), roomId)
    )

    return collection(
      this.firestore,
      "owners",
      x.get("owner"),
      "rooms",
      roomId,
      "actions"
    )
  }

  onSnapshotRoom(
    roomId: Room["id"],
    onNext: ((data: Room | InvalidDoc) => void) & ProxyMarked
  ): Unsubscribe & ProxyMarked {
    let room$: Observable<Room | InvalidDoc>

    if (detectMode(roomId) === "public") {
      room$ = snapshotOf(doc(collection(this.firestore, "rooms"), roomId)).pipe(
        mapToRoom(roomId)
      )
    } else {
      const ownerId$ = snapshotOf(
        doc(collection(this.firestore, "room-owners"), roomId)
      ).pipe(
        // TODO room-owners owner field に型制約を持たせたい（タイポに気付けない）
        map((_) => (_.get("owner") || null) as string | null),
        distinctUntilChanged(),
        takeWhile((_) => _ === null, true)
      )

      room$ = ownerId$.pipe(
        switchMap((owner) => {
          if (owner === null) {
            return of<InvalidDoc>(["invalid-doc", roomId])
          }

          return snapshotOf(
            doc(collection(this.firestore, "owners", owner, "rooms"), roomId)
          ).pipe(mapToRoom(roomId))
        })
      )
    }

    const sub = room$.subscribe((_) => {
      onNext(_)
    })

    return proxy(() => {
      sub.unsubscribe()
    })
  }

  async onSnapshotTimerState(
    roomId: Room["id"],
    onNext: ((data: TimerState) => void) & ProxyMarked
  ): Promise<Unsubscribe & ProxyMarked> {
    const selectActions = await this.selectActions(roomId)
    const queryActions = await getDocs(
      query(
        selectActions,
        where("type", "==", "start"),
        orderBy("createdAt", "asc"),
        limitToLast(1)
      )
    ).then(({ docs: [doc] }) =>
      query(
        selectActions,
        orderBy("createdAt", "asc"),
        ...(hasNoEstimateTimestamp(doc?.metadata) ? [startAt(doc)] : [])
      )
    )

    const unsubscribe = onSnapshot(queryActions, (snapshot) => {
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
      await this.selectActions(roomId),
      withMeta(convertServerTimestamp(action))
    )
  }

  async setupRoom(
    roomId: Room["id"],
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
        const roomDoc = await transaction.get(await this.selectRoom(roomId))
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
          doc(await this.selectActions(roomId)),
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
        const roomDoc = await transaction.get(await this.selectRoom(roomId))
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
