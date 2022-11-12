import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { partition } from "rxjs"
import { App } from "./App"
import { createNewRoom } from "./createNewRoom"
import { ErrorBoundary } from "./ErrorBoundary"
import { FullViewportOops } from "./FullViewportOops"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { initializeFirestore } from "./initializeFirestore"
import { isRoom, mapToRoom } from "./mapToRoom"
import { mapToRoomId, mapToRoute } from "./mapToRoute"
import { calibrateClock } from "./now"
import { observeHash } from "./observeHash"
import { observeMediaPermission } from "./observeMediaPermission"
import { restoreRoom } from "./restoreRoom"
import smallAlert from "./sound/small-alert.mp3"
import { AudioProvider, MediaPermissionProvider } from "./useAudio"
import { FirestoreProvider } from "./useFirestore"

const firestore = await initializeFirestore()

calibrateClock(firestore).catch((reason: unknown) => {
  console.warn("calibration failed", reason)
})

const root = document.getElementById("root")!

const audio = new Audio(smallAlert)
const permission$ = observeMediaPermission(audio, root)

const route$ = observeHash().pipe(mapToRoute())

const [room$, invalid$] = partition(
  route$.pipe(mapToRoomId(), mapToRoom(firestore)),
  isRoom
)

createNewRoom(route$)
restoreRoom(firestore, invalid$)

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary fallback={<FullViewportOops />}>
      <FirestoreProvider value={firestore}>
        <AudioProvider value={audio}>
          <MediaPermissionProvider value={permission$}>
            <Suspense fallback={<FullViewportProgress />}>
              <App route$={route$} room$={room$} />
            </Suspense>
          </MediaPermissionProvider>
        </AudioProvider>
      </FirestoreProvider>
    </ErrorBoundary>
  </StrictMode>
)
