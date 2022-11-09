import { doc, Firestore } from "firebase/firestore"
import { map, OperatorFunction, pipe, switchMap } from "rxjs"
import { collection } from "./firestore/collection"
import { shareRecent } from "./util/shareRecent"
import { snapshotOf } from "./util/snapshotOf"
import { Room, roomZod } from "./zod/roomZod"

export function isRoom(value: Room | InvalidDoc): value is Room {
  return !Array.isArray(value)
}

export type InvalidDoc = [reason: "invalid-doc", payload: Room["id"]]

export function mapToRoom(
  db: Firestore
): OperatorFunction<Room["id"], Room | InvalidDoc> {
  return pipe(
    switchMap((roomId) =>
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
        })
      )
    ),

    shareRecent(30_000)
  )
}
