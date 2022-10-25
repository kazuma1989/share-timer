import { Firestore } from "firebase/firestore"
import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { from, map, Observable, OperatorFunction, scan } from "rxjs"
import { App } from "./App"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { initializeFirestore } from "./initializeFirestore"
import { initializeRoom } from "./initializeRoom"
import { calibrateClock } from "./now"
import { observeCurrentDuration } from "./observeCurrentDuration"
import { observeHash } from "./observeHash"
import { observeMediaPermission } from "./observeMediaPermission"
import { observeRoom, observeRoom2 } from "./observeRoom"
import { observeTimerState } from "./observeTimerState"
import smallAlert from "./sound/small-alert.mp3"
import { AudioProvider, MediaPermissionProvider } from "./useAudio"
import {
  CurrentDurationUIProvider,
  CurrentDurationWorkerProvider,
} from "./useCurrentDuration"
import { FirestoreProvider } from "./useFirestore"
import { RoomProvider } from "./useRoom"
import { TimerStateProvider } from "./useTimerState"
import { interval } from "./util/interval"
import { sparse } from "./util/sparse"
import { Room } from "./zod/roomZod"

const firestore = await initializeFirestore()

calibrateClock(firestore).catch((reason) => {
  console.warn("calibration failed", reason)
})

const audio = new Audio(smallAlert)
const permission$ = observeMediaPermission(audio)

const hash$ = observeHash()

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

mockHash$.pipe(
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

const [room$, invalid$] = observeRoom(firestore, hash$)
const timerState$ = observeTimerState(firestore, room$)

const ui$ = observeCurrentDuration(timerState$, interval("ui"))
const worker$ = observeCurrentDuration(timerState$, interval("worker", 100))

initializeRoom(firestore, room$, invalid$)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FirestoreProvider value={firestore}>
      <AudioProvider value={audio}>
        <MediaPermissionProvider value={permission$}>
          <RoomProvider value={room$}>
            <TimerStateProvider value={timerState$}>
              <CurrentDurationUIProvider value={ui$}>
                <CurrentDurationWorkerProvider value={worker$}>
                  <Suspense fallback={<FullViewportProgress />}>
                    <App />
                  </Suspense>
                </CurrentDurationWorkerProvider>
              </CurrentDurationUIProvider>
            </TimerStateProvider>
          </RoomProvider>
        </MediaPermissionProvider>
      </AudioProvider>
    </FirestoreProvider>
  </StrictMode>
)
