import {
  doc,
  Firestore,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore"
import { collection } from "./collection"
import { RoomOnFirestore } from "./roomZod"
import { TimerActionOnFirestore } from "./timerAction"
import { useFirestore } from "./useFirestore"
import { useHash } from "./useHash"

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
