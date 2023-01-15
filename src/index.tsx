// @ts-expect-error
import { StrictMode, Suspense } from "react"
// @ts-expect-error
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
// @ts-expect-error
import { AudioProvider, createAudio, MediaPermissionProvider } from "./useAudio"
// @ts-expect-error
import { DarkModeProvider, observeDarkMode } from "./useDarkMode"
// @ts-expect-error
import { createVideoTimer, VideoTimerProvider } from "./useVideoTimer"
import { nanoid } from "./util/nanoid"

run()

async function run() {
  // https://neos21.net/blog/2018/08/19-01.html
  document.body.addEventListener("touchstart", () => {}, { passive: true })

  if (!getItem("userId")) {
    setItem("userId", nanoid(10))
  }

  const videoTimer = createVideoTimer()

  const darkMode$ = observeDarkMode()

  const context = new AudioContext()
  const permission$ = observeAudioPermission(context)

  const audioData = await fetch(smallAlert).then((_) => _.arrayBuffer())
  const audio = createAudio(context, audioData)

  const route$ = observeHash()

  const firestore = await initializeFirestore()

  calibrateClock(firestore).catch((reason: unknown) => {
    console.warn("calibration failed", reason)
  })

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <FirestoreImplProvider firestore={firestore}>
        <ErrorBoundary fallback={<FullViewportOops />}>
          <VideoTimerProvider value={videoTimer}>
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
}
