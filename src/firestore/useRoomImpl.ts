import { proxy } from "comlink"
import { Observable } from "rxjs"
import { createCache } from "../util/createCache"
import { shareRecent } from "../util/shareRecent"
import type { InvalidDoc, Room } from "../zod/roomZod"
import { useFirestore } from "./useFirestore"

export function useRoomImpl(roomId: Room["id"]): Observable<Room | InvalidDoc> {
  const firestore = useFirestore()

  const room$ = hardCache(roomId, () =>
    new Observable<Room | InvalidDoc>((subscriber) => {
      const unsubscribe$ = firestore.onSnapshotRoom(
        roomId,
        proxy((data) => {
          subscriber.next(data)
        })
      )

      return async () => {
        const unsubscribe = await unsubscribe$
        unsubscribe()
      }
    }).pipe(shareRecent(30_000))
  )

  return room$
}

const hardCache = createCache(true)
