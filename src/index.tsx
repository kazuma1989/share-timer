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
import { VideoTimerProvider } from "./useVideoTimer"
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

const video = document.createElement("video")
video.setAttribute("role", "timer")
// フォーカス可能にしておかないと VoiceOver が読んでくれない
video.tabIndex = 0

const darkMode$ = observeDarkMode()

const context = new AudioContext()
const permission$ = observeAudioPermission(context)

const audioData = await fetch(smallAlert).then((_) => _.arrayBuffer())
const audio = createAudio(context, audioData)

const route$ = observeHash()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FirestoreImplProvider firestore={firestore}>
      <ErrorBoundary fallback={<FullViewportOops />}>
        <VideoTimerProvider value={video}>
          <DarkModeProvider value={darkMode$}>
            <AudioProvider value={audio}>
              <MediaPermissionProvider value={permission$}>
                <Suspense fallback={<FullViewportProgress />}>
                  <App route$={route$} />
                </Suspense>
              </MediaPermissionProvider>
            </AudioProvider>
          </DarkModeProvider>
        </VideoTimerProvider>
      </ErrorBoundary>
    </FirestoreImplProvider>
  </StrictMode>
)
