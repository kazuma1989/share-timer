import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { partition } from "rxjs"
import { App } from "./App"
import { ErrorBoundary } from "./ErrorBoundary"
import { FullViewportOops } from "./FullViewportOops"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { initializeFirestore } from "./initializeFirestore"
import { isRoom, mapToRoom } from "./mapToRoom"
import { calibrateClock } from "./now"
import { observeHash } from "./observeHash"
import { observeMediaPermission } from "./observeMediaPermission"
import { restoreRoom } from "./restoreRoom"
import smallAlert from "./sound/small-alert.mp3"
import { pickOnlyRoomId } from "./toRoute"
import { AudioProvider, MediaPermissionProvider } from "./useAudio"
import { FirestoreProvider } from "./useFirestore"

// https://neos21.net/blog/2018/08/19-01.html
document.body.addEventListener("touchstart", () => {}, { passive: true })

const firestore = await initializeFirestore()

calibrateClock(firestore).catch((reason: unknown) => {
  console.warn("calibration failed", reason)
})

const root = document.getElementById("root")!

const audio = new Audio(smallAlert)
const permission$ = observeMediaPermission(audio, root)

const route$ = observeHash()

const [room$, invalid$] = partition(
  route$.pipe(pickOnlyRoomId(), mapToRoom(firestore)),
  isRoom
)

restoreRoom(firestore, invalid$)

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
