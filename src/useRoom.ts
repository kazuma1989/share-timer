import { doc, getDoc } from "firebase/firestore"
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
      new Store((onChange) => {
        const abort = new AbortController()

        getDoc(doc(collection(db, "rooms"), roomId)).then((roomDoc) => {
          if (abort.signal.aborted) return

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
