import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { initializeFirestore } from "./initializeFirestore"
import { initializeRoom } from "./initializeRoom"
import { calibrateClock } from "./now"
import { observeHash } from "./observeHash"
import { observeRoom } from "./observeRoom"
import { observeTimerState } from "./observeTimerState"
import smallAlert from "./sound/small-alert.mp3"
import { AlertAudioProvider } from "./useAlertAudio"
import { FirestoreProvider } from "./useFirestore"
import { RoomProvider } from "./useRoom"
import { TimerStateProvider } from "./useTimerState"
import { checkAudioPermission } from "./util/checkAudioPermission"

const firestore = await initializeFirestore()

calibrateClock(firestore).catch((reason) => {
  console.warn("calibration failed", reason)
})

const audio = new Audio(smallAlert)

document.body.addEventListener(
  "click",
  async () => {
    const permission = await checkAudioPermission(audio)
    if (permission === "denied") {
      console.warn("Cannot play audio")
    }
  },
  {
    passive: true,
    once: true,
  }
)

const [room$, invalid$] = observeRoom(firestore, observeHash())
const timerState$ = observeTimerState(firestore, room$)

initializeRoom(firestore, room$, invalid$)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FirestoreProvider value={firestore}>
      <AlertAudioProvider value={audio}>
        <RoomProvider value={room$}>
          <TimerStateProvider value={timerState$}>
            <Suspense fallback={<FullViewportProgress />}>
              <App />
            </Suspense>
          </TimerStateProvider>
        </RoomProvider>
      </AlertAudioProvider>
    </FirestoreProvider>
  </StrictMode>
)
