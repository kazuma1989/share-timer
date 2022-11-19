import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import { ErrorBoundary } from "./ErrorBoundary"
import { useDispatchImpl } from "./firestore/useDispatchImpl"
import { FirestoreProvider } from "./firestore/useFirestore"
import { useRoomImpl } from "./firestore/useRoomImpl"
import { useTimerStateImpl } from "./firestore/useTimerStateImpl"
import { FullViewportOops } from "./FullViewportOops"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { initializeFirestore } from "./initializeFirestore"
import { calibrateClock } from "./now"
import { observeAudioPermission } from "./observeAudioPermission"
import { observeHash } from "./observeHash"
import smallAlert from "./sound/small-alert.mp3"
import { getItem, setItem } from "./storage"
import { AudioProvider, createAudio, MediaPermissionProvider } from "./useAudio"
import { UseDispatchProvider } from "./useDispatch"
import { UseRoomProvider } from "./useRoom"
import { UseTimerStateProvider } from "./useTimerState"
import { nanoid } from "./util/nanoid"

// https://neos21.net/blog/2018/08/19-01.html
document.body.addEventListener("touchstart", () => {}, { passive: true })

const firestore = await initializeFirestore()

calibrateClock(firestore).catch((reason: unknown) => {
  console.warn("calibration failed", reason)
})

if (!getItem("userId")) {
  setItem("userId", nanoid(10))
}

const root = document.getElementById("root")!

const route$ = observeHash()

const context = new AudioContext()
const permission$ = observeAudioPermission(context)

const audioData = await fetch(smallAlert).then((_) => _.arrayBuffer())
const audio = createAudio(context, audioData)

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary fallback={<FullViewportOops />}>
      <FirestoreProvider value={firestore}>
        <AudioProvider value={audio}>
          <MediaPermissionProvider value={permission$}>
            <UseDispatchProvider value={useDispatchImpl}>
              <UseRoomProvider value={useRoomImpl}>
                <UseTimerStateProvider value={useTimerStateImpl}>
                  <Suspense fallback={<FullViewportProgress />}>
                    <App route$={route$} />
                  </Suspense>
                </UseTimerStateProvider>
              </UseRoomProvider>
            </UseDispatchProvider>
          </MediaPermissionProvider>
        </AudioProvider>
      </FirestoreProvider>
    </ErrorBoundary>
  </StrictMode>
)
