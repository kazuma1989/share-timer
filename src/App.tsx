import { Firestore } from "firebase/firestore"
import { Suspense } from "react"
import {
  distinctUntilChanged,
  from,
  map,
  Observable,
  OperatorFunction,
  ReplaySubject,
  scan,
  shareReplay,
  switchMap,
} from "rxjs"
import { FlashCover } from "./FlashCover"
import { observeRoom2 } from "./observeRoom"
import { Progress } from "./Progress"
import { Timer } from "./Timer"
import { useFirestore } from "./useFirestore"
import { useObservable } from "./useObservable"
import { useRoom } from "./useRoom"
import { useTimerState } from "./useTimerState"
import { useTitleAsTimeViewer } from "./useTitleAsTimeViewer"
import { sparse } from "./util/sparse"
import { Room } from "./zod/roomZod"

export function App() {
  const room = useObservable(useRoom())

  useTitleAsTimeViewer()

  const timerState$ = useTimerState()

  firestore$.next(useFirestore())
  const roomObjects = useObservable(roomObjects$, [])

  return (
    <div className="container mx-auto h-screen">
      {roomObjects.map(({ roomId, value: room$ }) => (
        <Suspense key={roomId} fallback={<Progress className="h-20 w-20" />}>
          <X room$={room$} />
        </Suspense>
      ))}

      <Timer
        key={"timer" + room.id}
        timerState$={timerState$}
        className="h-full"
      />

      <FlashCover key={"cover" + room.id} timerState$={timerState$} />
    </div>
  )
}

function X({ room$ }: { room$: Observable<unknown> }) {
  const maybeRoom = useObservable(room$)

  return (
    <div>
      <pre>{JSON.stringify(maybeRoom, null, 2)}</pre>
    </div>
  )
}

const mockHash$ = from([
  "#Fu7tO8tmAnDS4KG1yBZp",
  "#Fu7tO8tmAnDS4KG1yBZp/______invalid_______",
  "#Fu7tO8tmAnDS4KG1yBZp/______invalid_______/Heik2XqX0kg9AfhPY7AS",
]).pipe(sparse(500))

const hash$ = mockHash$

const firestore$ = new ReplaySubject<Firestore>(1)

const roomObjects$ = firestore$.pipe(
  distinctUntilChanged(),
  switchMap((db) =>
    hash$.pipe(
      map((hash) => hash.slice("#".length).split("/")),
      roomIdsToRooms(db)
    )
  ),
  shareReplay(1)
)

// roomObjects$.subscribe((_) => {
//   console.log(_)
// })

interface RoomObject {
  roomId: string
  value: Observable<
    | Room
    | [reason: "invalid-doc", payload: Room["id"]]
    | [reason: "invalid-id", payload: string]
  >
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
            value: observeRoom2(db, roomId),
          }
      ),
    []
  )
}
