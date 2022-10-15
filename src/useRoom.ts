import { doc, Firestore, getDoc, writeBatch } from "firebase/firestore"
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
    Store.from(
      (async () => {
        const getRoom = () => getDoc(doc(collection(db, "rooms"), roomId))

        let roomDoc = await getRoom()
        if (!roomDoc.exists() || !roomZod.safeParse(roomDoc.data()).success) {
          await setupRoom(db, roomId)

          roomDoc = await getRoom()
        }

        const room: Room = {
          ...roomZod.parse(roomDoc.data()),
          id: roomId,
        }
        return room
      })()
    )
  )

  return store.getOrThrow()
}

const getOrPut = mapGetOrPut(new Map<Room["id"], Store<Room>>())

async function setupRoom(db: Firestore, newRoomId: string): Promise<void> {
  const batch = writeBatch(db)

  const rooms = collection(db, "rooms")
  batch.set(doc(rooms, newRoomId), withMeta<RoomOnFirestore>({}))

  const actions = collection(db, "rooms", newRoomId, "actions")
  const newActionId = doc(actions).id
  batch.set(
    doc(actions, newActionId),
    withMeta<ActionOnFirestore>({
      type: "edit-done",
      duration: DEFAULT_DURATION,
    })
  )

  await batch.commit()
}

const DEFAULT_DURATION = 3 * 60_000
