import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { filter, map, partition } from "rxjs"
import { App } from "./App"
import { ErrorBoundary } from "./ErrorBoundary"
import { FullViewportOops } from "./FullViewportOops"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { initializeFirestore } from "./initializeFirestore"
import { initializeRoom } from "./initializeRoom"
import { isRoom, mapToRoom } from "./mapToRoom"
import { calibrateClock } from "./now"
import { observeHash } from "./observeHash"
import { observeMediaPermission } from "./observeMediaPermission"
import smallAlert from "./sound/small-alert.mp3"
import { AudioProvider, MediaPermissionProvider } from "./useAudio"
import { FirestoreProvider } from "./useFirestore"
import { nonNullable } from "./util/nonNullable"
import { roomIdZod } from "./zod/roomZod"

const firestore = await initializeFirestore()

calibrateClock(firestore).catch((reason) => {
  console.warn("calibration failed", reason)
})

const root = document.getElementById("root")!

const audio = new Audio(smallAlert)
const permission$ = observeMediaPermission(audio, root)

const hash$ = observeHash()
const roomId$ = hash$.pipe(
  map((hash) => {
    const _ = roomIdZod.safeParse(hash)
    return _.success ? _.data : null
  }),
  filter(nonNullable)
)
const [room$, invalid$] = partition(roomId$.pipe(mapToRoom(firestore)), isRoom)

initializeRoom(firestore, invalid$)

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary fallback={<FullViewportOops />}>
      <FirestoreProvider value={firestore}>
        <AudioProvider value={audio}>
          <MediaPermissionProvider value={permission$}>
            <Suspense fallback={<FullViewportProgress />}>
              <App room$={room$} />
            </Suspense>
          </MediaPermissionProvider>
        </AudioProvider>
      </FirestoreProvider>
    </ErrorBoundary>
  </StrictMode>
)
