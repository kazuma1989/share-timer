import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import { ErrorBoundary } from "./ErrorBoundary"
import { calibrateClock } from "./firestore/calibrateClock"
import { FirestoreImplProvider } from "./firestore/FirestoreImplProvider"
import { initializeFirestore } from "./firestore/initializeFirestore"
import { FullViewportOops } from "./FullViewportOops"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { observeAudioPermission } from "./observeAudioPermission"
import { observeHash } from "./observeHash"
import smallAlert from "./sound/small-alert.mp3"
import { getItem, setItem } from "./storage"
import { AudioProvider, createAudio, MediaPermissionProvider } from "./useAudio"
import { DarkModeProvider, observeDarkMode } from "./useDarkMode"
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

const darkMode$ = observeDarkMode()

const context = new AudioContext()
const permission$ = observeAudioPermission(context)

const audioData = await fetch(smallAlert).then((_) => _.arrayBuffer())
const audio = createAudio(context, audioData)

const route$ = observeHash()

createRoot(root).render(
  <StrictMode>
    <FirestoreImplProvider firestore={firestore}>
      <ErrorBoundary fallback={<FullViewportOops />}>
        <DarkModeProvider value={darkMode$}>
          <AudioProvider value={audio}>
            <MediaPermissionProvider value={permission$}>
              <Suspense fallback={<FullViewportProgress />}>
                <App route$={route$} />
              </Suspense>
            </MediaPermissionProvider>
          </AudioProvider>
        </DarkModeProvider>
      </ErrorBoundary>
    </FirestoreImplProvider>
  </StrictMode>
)
