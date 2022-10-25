import { Firestore } from "firebase/firestore"
import { from, map, Observable, OperatorFunction, scan } from "rxjs"
import "./global.css"
import { initializeFirestore } from "./initializeFirestore"
import { observeRoom2 } from "./observeRoom"
import { sparse } from "./util/sparse"
import { Room } from "./zod/roomZod"

const firestore = await initializeFirestore()

// hash -> roomIds
// roomIds -> rooms
// room -> timerState
// timerState + interval -> currentDuration

const db = firestore

const mockHash$ = from([
  "#Fu7tO8tmAnDS4KG1yBZp",
  "#Fu7tO8tmAnDS4KG1yBZp/______invalid_______",
  "#Fu7tO8tmAnDS4KG1yBZp/______invalid_______/Heik2XqX0kg9AfhPY7AS",
]).pipe(sparse(500))

const hash$ = mockHash$

hash$.pipe(
  map((hash) => hash.slice("#".length).split("/")),
  roomIdsToRooms(db)
)

interface RoomObject {
  roomId: string
  room$: Observable<
    | Room
    | [reason: "invalid-doc", payload: Room["id"]]
    | [reason: "invalid-id", payload: string]
  >
  // firestore: Firestore
}

function roomIdsToRooms(
  db: Firestore
): OperatorFunction<string[], RoomObject[]> {
  return scan(
    (acc: RoomObject[], ids) =>
      ids.map(
        (roomId) =>
          acc.find((_) => _.roomId === roomId) ?? {
            roomId,
            room$: observeRoom2(db, roomId),
          }
      ),
    []
  )
}
