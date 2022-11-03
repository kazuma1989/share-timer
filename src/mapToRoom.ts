import { doc, Firestore } from "firebase/firestore"
import { map, of, OperatorFunction, pipe, switchMap } from "rxjs"
import { collection } from "./firestore/collection"
import { shareRecent } from "./util/shareRecent"
import { snapshotOf } from "./util/snapshotOf"
import { Room, roomIdZod, roomZod } from "./zod/roomZod"

export function isRoom(value: Room | InvalidDoc | InvalidId): value is Room {
  return !Array.isArray(value)
}

export type InvalidDoc = [reason: "invalid-doc", payload: Room["id"]]
export type InvalidId = [reason: "invalid-id", payload: string]

export function mapToRoom(
  db: Firestore
): OperatorFunction<string, Room | InvalidDoc | InvalidId> {
  return pipe(
    switchMap((id) => {
      const _ = roomIdZod.safeParse(id)
      if (!_.success) {
        return of<InvalidId>(["invalid-id", id])
      }

      const roomId = _.data

      return snapshotOf(doc(collection(db, "rooms"), roomId)).pipe(
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
        })
      )
    }),

    shareRecent(30_000)
  )
}
