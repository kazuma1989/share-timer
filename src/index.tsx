import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { partition } from "rxjs"
import { App } from "./App"
import { ErrorBoundary } from "./ErrorBoundary"
import { FullViewportOops } from "./FullViewportOops"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { initializeFirestore } from "./initializeFirestore"
import { initializeRoom } from "./initializeRoom"
import { mapToPageType, mapToRoomId } from "./mapToPageType"
import { isRoom, mapToRoom } from "./mapToRoom"
import { calibrateClock } from "./now"
import { observeHash } from "./observeHash"
import { observeMediaPermission } from "./observeMediaPermission"
import smallAlert from "./sound/small-alert.mp3"
import { Route, Switch } from "./Switch"
import { AudioProvider, MediaPermissionProvider } from "./useAudio"
import { FirestoreProvider } from "./useFirestore"

const firestore = await initializeFirestore()

calibrateClock(firestore).catch((reason) => {
  console.warn("calibration failed", reason)
})

const root = document.getElementById("root")!

const audio = new Audio(smallAlert)
const permission$ = observeMediaPermission(audio, root)

const pageType$ = observeHash().pipe(mapToPageType())
const [room$, invalid$] = partition(
  pageType$.pipe(mapToRoomId(), mapToRoom(firestore)),
  isRoom
)
initializeRoom(firestore, invalid$)

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary fallback={<FullViewportOops />}>
      <FirestoreProvider value={firestore}>
        <AudioProvider value={audio}>
          <MediaPermissionProvider value={permission$}>
            <Suspense fallback={<FullViewportProgress />}>
              <Switch pageType$={pageType$}>
                <Route path="room">
                  <App room$={room$} />
                </Route>

                <Route path="info">
                  <Info />
                </Route>

                <Route path="unknown">
                  <NotFound />
                </Route>
              </Switch>
            </Suspense>
          </MediaPermissionProvider>
        </AudioProvider>
      </FirestoreProvider>
    </ErrorBoundary>
  </StrictMode>
)

function Info() {
  return <div>Info</div>
}

function NotFound() {
  return <div>NotFound</div>
}
