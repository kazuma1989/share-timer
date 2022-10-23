import { doc, Firestore, writeBatch } from "firebase/firestore"
import { collection } from "./firestore/collection"
import { withMeta } from "./firestore/withMeta"
import { ActionOnFirestore } from "./zod/actionZod"
import { RoomOnFirestore } from "./zod/roomZod"

export async function setupRoom(
  db: Firestore,
  newRoomId: string
): Promise<void> {
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
      type: "cancel",
      withDuration: DEFAULT_DURATION,
    })
  )

  await batch.commit()
}

const DEFAULT_DURATION = 3 * 60000
