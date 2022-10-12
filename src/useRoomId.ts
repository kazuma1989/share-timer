import {
  doc,
  Firestore,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore"
import { useSyncExternalStore } from "react"
import { z } from "zod"
import { collection } from "./collection"
import { mapGetOrPut } from "./mapGetOrPut"
import { Store } from "./Store"
import { TimerActionOnFirestore } from "./timerAction"
import { useFirestore } from "./useFirestore"
import { useHash } from "./useHash"

export const roomZod = z.object({
  lastEditAt: z.instanceof(Timestamp),
})

export interface Room extends z.output<typeof roomZod> {
  id: string
}

export interface RoomOnFirestore extends z.input<typeof roomZod> {}

const getOrPut = mapGetOrPut(new Map<Room["id"], Store<Room>>())

function useRoom(roomId: string): Room {
  const db = useFirestore()
  const store = getOrPut(
    roomId,
    () =>
      new Store((onChange) =>
        onSnapshot(doc(collection(db, "rooms"), roomId), (doc) => {
          onChange({
            ...roomZod.parse(doc.data()),
            id: doc.id,
          })
        })
      )
  )

  return useSyncExternalStore(store.subscribe, store.getOrThrow)
}

// FIXME 存在しないroomIdを指定された場合はどうする？
export function useRoomId(): string {
  const db = useFirestore()

  const roomId = useHash().slice("#".length)
  if (roomId) {
    return roomId
  }

  throw setupNewRoom(db).then((newRoomId) => {
    window.location.hash = newRoomId
  })
}

async function setupNewRoom(db: Firestore): Promise<string> {
  const batch = writeBatch(db)

  const rooms = collection(db, "rooms")
  const newRoomId = doc(rooms).id
  const newRoom: RoomOnFirestore = {
    lastEditAt: serverTimestamp() as Timestamp,
  }
  batch.set(doc(rooms, newRoomId), {
    ...newRoom,
    createdAt: serverTimestamp(),
  })

  const actions = collection(db, "rooms", newRoomId, "actions")
  const newActionId = doc(actions).id
  const newAction: TimerActionOnFirestore = {
    type: "edit-done",
    duration: 3 * 60_000,
  }
  batch.set(doc(actions, newActionId), {
    ...newAction,
    createdAt: serverTimestamp(),
  })

  await batch.commit()

  return newRoomId
}
