import { doc, onSnapshot } from "firebase/firestore"
import { useSyncExternalStore } from "react"
import { collection } from "./collection"
import { mapGetOrPut } from "./mapGetOrPut"
import { Room, roomZod } from "./roomZod"
import { Store } from "./Store"
import { useFirestore } from "./useFirestore"

export function useRoom(roomId: string): Room {
  const db = useFirestore()

  const store = getOrPut(
    roomId,
    () =>
      new Store((onChange) =>
        onSnapshot(doc(collection(db, "rooms"), roomId), (doc) => {
          const room: Room = {
            ...roomZod.parse(doc.data()),
            id: doc.id,
          }

          onChange(room)
        })
      )
  )

  return useSyncExternalStore(store.subscribe, store.getOrThrow)
}

const getOrPut = mapGetOrPut(new Map<Room["id"], Store<Room>>())
