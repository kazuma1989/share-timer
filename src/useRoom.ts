import {
  doc,
  Firestore,
  getDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore"
import { ActionOnFirestore } from "./actionZod"
import { collection } from "./collection"
import { mapGetOrPut } from "./mapGetOrPut"
import { Room, RoomOnFirestore, roomZod } from "./roomZod"
import { Store } from "./Store"
import { useFirestore } from "./useFirestore"
import { setHash, useHash } from "./useHash"

export function useRoom(): Room {
  const db = useFirestore()

  let roomId = useHash().slice("#".length)
  if (!roomId) {
    roomId = doc(collection(db, "rooms")).id
    setHash(roomId)
  }

  const store = getOrPut(
    roomId,
    () =>
      new Store((onChange) => {
        const abort = new AbortController()

        const roomRef = doc(collection(db, "rooms"), roomId)

        getDoc(roomRef).then(async (roomDoc) => {
          if (abort.signal.aborted) return

          if (!roomDoc.exists()) {
            await setupRoom(db, roomId)
            if (abort.signal.aborted) return

            roomDoc = await getDoc(roomRef)
            if (abort.signal.aborted) return
          }

          const room: Room = {
            ...roomZod.parse(roomDoc.data()),
            id: roomDoc.id,
          }

          onChange(room)
        })

        return () => {
          abort.abort()
        }
      })
  )

  return store.getOrThrow()
}

const getOrPut = mapGetOrPut(new Map<Room["id"], Store<Room>>())

async function setupRoom(db: Firestore, newRoomId: string): Promise<void> {
  const batch = writeBatch(db)

  const rooms = collection(db, "rooms")
  const newRoom: RoomOnFirestore = {
    lastEditAt: serverTimestamp() as Timestamp,
  }
  batch.set(doc(rooms, newRoomId), {
    ...newRoom,
    createdAt: serverTimestamp(),
  })

  const actions = collection(db, "rooms", newRoomId, "actions")
  const newActionId = doc(actions).id
  const newAction: ActionOnFirestore = {
    type: "edit-done",
    duration: 3 * 60_000,
  }
  batch.set(doc(actions, newActionId), {
    ...newAction,
    createdAt: serverTimestamp(),
  })

  await batch.commit()
}
