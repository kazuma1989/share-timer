import { Firestore } from "firebase/firestore"
import { Observable, OperatorFunction, scan } from "rxjs"
import { observeRoom2 } from "./observeRoom"
import { Room } from "./zod/roomZod"

export interface RoomObject {
  roomId: string
  room$: Observable<
    | Room
    | [reason: "invalid-doc", payload: Room["id"]]
    | [reason: "invalid-id", payload: string]
  >
  firestore: Firestore
}

export function roomIdsToRooms(
  db: Firestore
): OperatorFunction<string[], RoomObject[]> {
  return scan(
    (acc: RoomObject[], ids) =>
      ids.map(
        (roomId): RoomObject =>
          acc.find((_) => _.roomId === roomId) ?? {
            roomId,
            room$: observeRoom2(db, roomId),
            firestore: db,
          }
      ),
    []
  )
}
