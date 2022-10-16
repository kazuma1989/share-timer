import { doc, Firestore, onSnapshot, writeBatch } from "firebase/firestore"
import { useSyncExternalStore } from "react"
import { ActionOnFirestore } from "./actionZod"
import { collection } from "./collection"
import { mapGetOrPut } from "./mapGetOrPut"
import { Room, roomIdZod, RoomOnFirestore, roomZod } from "./roomZod"
import { Store } from "./Store"
import { useFirestore } from "./useFirestore"
import { setHash, useHash } from "./useHash"
import { withMeta } from "./withMeta"

export function useRoom(): Room {
  const db = useFirestore()

  const _ = roomIdZod.safeParse(useHash().slice("#".length))
  const roomId = _.success
    ? _.data
    : roomIdZod.parse(doc(collection(db, "rooms")).id)
  if (!_.success) {
    setHash(roomId)
  }

  const store = getOrPut(roomId, () =>
    Store.from((next) =>
      onSnapshot(doc(collection(db, "rooms"), roomId), (roomDoc) => {
        if (!roomDoc.exists() || !roomZod.safeParse(roomDoc.data()).success) {
          setupRoom(db, roomId)
          return
        }

        next({
          ...roomZod.parse(roomDoc.data()),
          id: roomId,
        })
      })
    )
  )

  return useSyncExternalStore(store.subscribe, store.getOrThrow)
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
      type: "edit-done",
      duration: DEFAULT_DURATION,
    })
  )

  await batch.commit()
}

const DEFAULT_DURATION = 3 * 60_000
