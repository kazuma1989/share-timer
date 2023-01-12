import { proxy } from "comlink"
import type { DocumentData } from "firebase/firestore"
import { map, Observable } from "rxjs"
import { createCache } from "../util/createCache"
import { shareRecent } from "../util/shareRecent"
import { roomZod, type InvalidDoc, type Room } from "../zod/roomZod"
import { useFirestore } from "./useFirestore"

export function useRoomImpl(roomId: Room["id"]): Observable<Room | InvalidDoc> {
  const firestore = useFirestore()

  const room$ = hardCache(roomId, () =>
    new Observable<DocumentData>((subscriber) => {
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
    }).pipe(
      map((rawData): Room | InvalidDoc => {
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
