import { createCache } from "$lib/util/createCache"
import { nonNullable } from "$lib/util/nonNullable"
import { shareRecent } from "$lib/util/shareRecent"
import { expose, proxy, type ProxyMarked } from "comlink"
import { initializeApp, type FirebaseOptions } from "firebase/app"
import {
  connectAuthEmulator,
  indexedDBLocalPersistence,
  initializeAuth,
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
  query,
  runTransaction,
  serverTimestamp as firestoreServerTimestamp,
  setDoc,
  startAt,
  Timestamp,
  type Firestore,
} from "firebase/firestore"
import {
  distinctUntilChanged,
  filter,
  lastValueFrom,
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
  type InvalidDoc,
  type Room,
  type RoomInput,
} from "../../schema/roomSchema"
import { timerReducer, type TimerState } from "../../schema/timerReducer"
import { setTransferHandlers } from "../../setTransferHandlers"
import { calibrationSchema, type Calibration } from "./calibrationSchema"
import { collection } from "./collection"
import { convertServerTimestamp } from "./convertServerTimestamp"
import { hasNoEstimateTimestamp } from "./hasNoEstimateTimestamp"
import { mapToRoom } from "./mapToRoom"
import { orderBy } from "./orderBy"
import { roomOwnerSchema, type RoomOwner } from "./roomOwnerSchema"
import { snapshotOf } from "./snapshotOf"
import { where } from "./where"
import { withMeta } from "./withMeta"

export class RemoteFirestore {
  private readonly firestore: Firestore

  private readonly auth: Auth

  private readonly ownerIdCache = createCache(true)

  constructor(options: FirebaseOptions) {
    this.firestore = getFirestore(initializeApp(options))

    if (import.meta.env.VITE_FIRESTORE_EMULATOR) {
      const host = self.location.hostname
      const port = import.meta.env.FIREBASE_EMULATORS.firestore.port
      console.info(`using emulator (${host}:${port})`)

      connectFirestoreEmulator(this.firestore, host, port)
    }

    setTransferHandlers()

    this.auth = initializeAuth(this.firestore.app, {
      persistence: indexedDBLocalPersistence,
      // No popupRedirectResolver defined
    })

    if (import.meta.env.VITE_AUTH_EMULATOR) {
      const protocol = self.location.protocol
      const host = self.location.hostname
      const port = import.meta.env.FIREBASE_EMULATORS.auth.port

      connectAuthEmulator(this.auth, `${protocol}//${host}:${port}`)
    }
  }

  private getOwnerId(roomId: Room["id"]): Observable<string | null> {
    return this.ownerIdCache(roomId, () =>
      snapshotOf(doc(collection(this.firestore, "room-owners"), roomId)).pipe(
        map((snapshot): string | null => {
          const rawData = snapshot.data({
            serverTimestamps: "estimate",
          })

          const [error, data] = s.validate(rawData, roomOwnerSchema)
          if (error) {
            if (rawData) {
              console.warn(rawData, error)
            }

            return null
          } else {
            return data.owner
          }
        }),
        distinctUntilChanged(),
        takeWhile((_) => _ === null, true),
        shareRecent()
      )
    )
  }

  onSnapshotRoom(
    roomId: Room["id"],
    onNext: ((data: Room | InvalidDoc) => void) & ProxyMarked
  ): (() => void) & ProxyMarked {
    const room$ =
      detectMode(roomId) === "public"
        ? snapshotOf(doc(collection(this.firestore, "rooms"), roomId)).pipe(
            mapToRoom(roomId)
          )
        : this.getOwnerId(roomId).pipe(
            switchMap((owner) => {
              if (owner === null) {
                return of<InvalidDoc>(["invalid-doc", roomId])
              }

              return snapshotOf(
                doc(
                  collection(this.firestore, "owners", owner, "rooms"),
                  roomId
                )
              ).pipe(mapToRoom(roomId))
            })
          )

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
  ): Promise<(() => void) & ProxyMarked> {
    const selectActions =
      detectMode(roomId) === "public"
        ? collection(this.firestore, "rooms", roomId, "actions")
        : collection(
            this.firestore,
            "owners",
            await lastValueFrom(
              this.getOwnerId(roomId).pipe(filter(nonNullable))
            ),
            "rooms",
            roomId,
            "actions"
          )

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

    const timerState$ = snapshotOf(queryActions).pipe(
      map((snapshot) => {
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

        return actions.reduce(timerReducer, {
          mode: "editing",
          initialDuration: 0,
        })
      })
    )

    const sub = timerState$.subscribe((_) => {
      onNext(_)
    })

    return proxy(() => {
      sub.unsubscribe()
    })
  }

  async dispatch(roomId: Room["id"], action: ActionInput): Promise<void> {
    const selectActions =
      detectMode(roomId) === "public"
        ? collection(this.firestore, "rooms", roomId, "actions")
        : collection(
            this.firestore,
            "owners",
            await lastValueFrom(
              this.getOwnerId(roomId).pipe(filter(nonNullable))
            ),
            "rooms",
            roomId,
            "actions"
          )

    await addDoc(selectActions, withMeta(convertServerTimestamp(action)))
  }

  async setupRoom(
    roomId: Room["id"],
    aborted: (() => PromiseLike<boolean> | boolean) & ProxyMarked
  ): Promise<void> {
    let owner: string | null
    if (detectMode(roomId) === "public") {
      owner = null
    } else if (this.auth.currentUser !== null) {
      owner = this.auth.currentUser.uid
    } else {
      throw "private-room-but-not-signed-in"
    }

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
          doc(
            owner
              ? collection(this.firestore, "owners", owner, "rooms")
              : collection(this.firestore, "rooms"),
            roomId
          )
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

        if (owner) {
          transaction.set(
            doc(collection(this.firestore, "room-owners"), roomId),
            withMeta({
              owner,
            } satisfies RoomOwner)
          )
        }

        transaction.set(
          doc(
            owner
              ? collection(
                  this.firestore,
                  "owners",
                  owner,
                  "rooms",
                  roomId,
                  "actions"
                )
              : collection(this.firestore, "rooms", roomId, "actions")
          ),
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

  onSnapshotCheckoutSession(
    uid: string,
    onNext: ((data: unknown) => void) & ProxyMarked
  ): (() => void) & ProxyMarked {
    const sessions$ = snapshotOf(
      query(
        collection(this.firestore, "checkout-sessions"),
        where("client_reference_id", "==", uid)
      )
    ).pipe(
      map((snapshot) =>
        snapshot.docs.flatMap((doc) => {
          const rawData = doc.data({
            serverTimestamps: "estimate",
          })

          return [rawData]
        })
      )
    )

    const sub = sessions$.subscribe((_) => {
      onNext(_)
    })

    return proxy(() => {
      sub.unsubscribe()
    })
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

expose(RemoteFirestore)

const DEFAULT_DURATION = 3 * 60000
