import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { map, partition } from "rxjs"
import { App } from "./App"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { initializeFirestore } from "./initializeFirestore"
import { initializeRoom } from "./initializeRoom"
import { calibrateClock } from "./now"
import { observeHash } from "./observeHash"
import { observeMediaPermission } from "./observeMediaPermission"
import { isRoom, toRoom } from "./observeRoom"
import smallAlert from "./sound/small-alert.mp3"
import { AudioProvider, MediaPermissionProvider } from "./useAudio"
import { FirestoreProvider } from "./useFirestore"

const firestore = await initializeFirestore()

calibrateClock(firestore).catch((reason) => {
  console.warn("calibration failed", reason)
})

const root = document.getElementById("root")!

const audio = new Audio(smallAlert)
const permission$ = observeMediaPermission(audio, root)

const roomId$ = observeHash().pipe(map((hash) => hash.slice("#".length)))
const [room$, invalid$] = partition(roomId$.pipe(toRoom(firestore)), isRoom)

initializeRoom(firestore, room$, invalid$)

createRoot(root).render(
  <StrictMode>
    <FirestoreProvider value={firestore}>
      <AudioProvider value={audio}>
        <MediaPermissionProvider value={permission$}>
          <Suspense fallback={<FullViewportProgress />}>
            <App room$={room$} />
          </Suspense>
        </MediaPermissionProvider>
      </AudioProvider>
    </FirestoreProvider>
  </StrictMode>
)
