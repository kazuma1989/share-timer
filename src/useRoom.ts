import {
  doc,
  Firestore,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore"
import { useSyncExternalStore } from "react"
import { Observable, share, timer } from "rxjs"
import { collection } from "./firestore/collection"
import { withMeta } from "./firestore/withMeta"
import { useFirestore } from "./useFirestore"
import { replaceHash, useHash } from "./useHash"
import { createStore, Store } from "./util/createStore"
import { mapGetOrPut } from "./util/mapGetOrPut"
import { ActionOnFirestore } from "./zod/actionZod"
import { Room, roomIdZod, RoomOnFirestore, roomZod } from "./zod/roomZod"

export function useRoom(): Room {
  const db = useFirestore()

  const _ = roomIdZod.safeParse(useHash().slice("#".length))
  if (!_.success) {
    throw Promise.resolve().then(() => {
      const newRoomId = roomIdZod.parse(doc(collection(db, "rooms")).id)
      replaceHash(newRoomId)
    })
  }

  const roomId = _.data

  const store = getOrPut(roomId, () =>
    createStore(
      new Observable<Room>((subscriber) =>
        onSnapshot(doc(collection(db, "rooms"), roomId), (roomDoc) => {
          if (!roomDoc.exists() || !roomZod.safeParse(roomDoc.data()).success) {
            setupRoom(db, roomId)
            return
          }

          subscriber.next({
            ...roomZod.parse(roomDoc.data()),
            id: roomId,
          })
        })
      ).pipe(
        share({
          // リスナーがいなくなって30秒後に根元の購読も解除する
          resetOnRefCountZero: () => timer(30_000),
        })
      )
    )
  )

  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}

const getOrPut = mapGetOrPut(new Map<Room["id"], Store<Room>>())

async function setupRoom(db: Firestore, newRoomId: string): Promise<void> {
  const batch = writeBatch(db)

  const emoji = await import("./emoji/Animals & Nature.json").then(
    (_) => _.default
  )
  const e = emoji[(Math.random() * emoji.length) | 0]!

  const rooms = collection(db, "rooms")
  batch.set(
    doc(rooms, newRoomId),
    withMeta<RoomOnFirestore>({
      name: e.value + " " + e.name,
    })
  )

  const actions = collection(db, "rooms", newRoomId, "actions")
  batch.set(
    doc(actions),
    withMeta<ActionOnFirestore>({
      type: "start",
      withDuration: DEFAULT_DURATION,
      at: serverTimestamp(),
    })
  )
  batch.set(
    doc(actions),
    withMeta<ActionOnFirestore>({
      type: "cancel",
    })
  )

  await batch.commit()
}

const DEFAULT_DURATION = 3 * 60_000
