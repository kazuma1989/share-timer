import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import { ErrorBoundary } from "./ErrorBoundary"
import { FullViewportOops } from "./FullViewportOops"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { initializeFirestore } from "./initializeFirestore"
import { calibrateClock } from "./now"
import { observeHash } from "./observeHash"
import { observeMediaPermission } from "./observeMediaPermission"
import smallAlert from "./sound/small-alert.mp3"
import { getItem, setItem } from "./storage"
import { Audio, AudioProvider, MediaPermissionProvider } from "./useAudio"
import { FirestoreProvider } from "./useFirestore"
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

const _audio = new globalThis.Audio(smallAlert)
const permission$ = observeMediaPermission(_audio, root)

const route$ = observeHash()

const audio: Audio = {
  start() {
    _audio.play()
  },
  stop() {
    _audio.pause()
  },
  async reset() {},
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary fallback={<FullViewportOops />}>
      <FirestoreProvider value={firestore}>
        <AudioProvider value={audio}>
          <MediaPermissionProvider value={permission$}>
            <Suspense fallback={<FullViewportProgress />}>
              <App route$={route$} />
            </Suspense>
          </MediaPermissionProvider>
        </AudioProvider>
      </FirestoreProvider>
    </ErrorBoundary>
  </StrictMode>
)
