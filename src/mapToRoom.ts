import { doc, Firestore } from "firebase/firestore"
import { map, of, OperatorFunction, switchMap } from "rxjs"
import { collection } from "./firestore/collection"
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
  return switchMap((id) => {
    const _ = roomIdZod.safeParse(id)
    if (!_.success) {
      return of<InvalidId>(["invalid-id", id])
    }

    const roomId = _.data

    return snapshotOf(doc(collection(db, "rooms"), roomId)).pipe(
      map((doc): Room | InvalidDoc => {
        const _ = roomZod.safeParse(doc.data())
        if (!_.success) {
          return ["invalid-doc", roomId]
        }

        return {
          ..._.data,
          id: roomId,
        }
      })
    )
  })
}
