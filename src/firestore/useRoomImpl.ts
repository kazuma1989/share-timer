import { doc } from "firebase/firestore"
import { map, type Observable } from "rxjs"
import { createCache } from "../util/createCache"
import { shareRecent } from "../util/shareRecent"
import { roomZod, type InvalidDoc, type Room } from "../zod/roomZod"
import { collection } from "./collection"
import { snapshotOf } from "./snapshotOf"
import { useFirestore } from "./useFirestore.1"

export function useRoomImpl(roomId: Room["id"]): Observable<Room | InvalidDoc> {
  const db = useFirestore()

  const room$ = hardCache(roomId, () =>
    snapshotOf(doc(collection(db, "rooms"), roomId)).pipe(
      map((doc): Room | InvalidDoc => {
        const rawData = doc.data()
        const _ = roomZod.safeParse(rawData)
        if (!_.success) {
          if (rawData) {
            console.debug(rawData, _.error)
          }

          return ["invalid-doc", roomId]
        }

        return {
          ..._.data,
          id: roomId,
        }
      }),
      shareRecent(30_000)
    )
  )

  return room$
}

const hardCache = createCache(true)
