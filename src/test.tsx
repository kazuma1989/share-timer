import { distinctUntilChanged, filter, firstValueFrom, from, map } from "rxjs"
import "./global.css"
import { initializeFirestore } from "./initializeFirestore"
import { toCurrentDuration } from "./observeCurrentDuration"
import { toTimerState } from "./observeTimerState"
import { roomIdsToRooms } from "./roomIdsToRooms"
import { floor, interval } from "./util/interval"
import { sparse } from "./util/sparse"
import { Room } from "./zod/roomZod"

const firestore = await initializeFirestore()

// hash -> roomIds
// roomIds -> rooms
// room -> timerState
// timerState + interval -> currentDuration

// const db = firestore

const mockHash$ = from([
  "#gD1zUX9TwX0axH0lWUEi",
  // "#Fu7tO8tmAnDS4KG1yBZp/______invalid_______",
  // "#Fu7tO8tmAnDS4KG1yBZp/______invalid_______/Heik2XqX0kg9AfhPY7AS",
]).pipe(sparse(500))

const hash$ = mockHash$

const roomIds$ = hash$.pipe(map((hash) => hash.slice("#".length).split("/")))

const roomObjects$ = roomIds$.pipe(roomIdsToRooms(firestore))

const [roomObject] = await firstValueFrom(roomObjects$)

if (roomObject) {
  const { room$, firestore: db } = roomObject

  const _room$ = room$.pipe(filter((_): _ is Room => !Array.isArray(_)))

  const timerState$ = _room$.pipe(
    map((_) => _.id),
    distinctUntilChanged(),
    toTimerState(db)
  )

  timerState$.subscribe((timerState) => {
    console.log(timerState)
  })

  const duration$ = timerState$.pipe(
    toCurrentDuration(interval("ui")),
    map((_) => ({
      ..._,
      duration: floor(_.duration),
    })),
    distinctUntilChanged(
      (left, right) =>
        left.mode === right.mode && left.duration === right.duration
    )
  )

  duration$.subscribe((_) => {
    console.log(_)
  })
}
