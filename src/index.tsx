import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { map } from "rxjs"
import { App } from "./App"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { initializeFirestore } from "./initializeFirestore"
import { calibrateClock } from "./now"
import { observeHash } from "./observeHash"
import { observeMediaPermission } from "./observeMediaPermission"
import { roomIdsToRooms } from "./roomIdsToRooms"
import smallAlert from "./sound/small-alert.mp3"
import { AudioProvider, MediaPermissionProvider } from "./useAudio"

const firestore = await initializeFirestore()

calibrateClock(firestore).catch((reason) => {
  console.warn("calibration failed", reason)
})

const audio = new Audio(smallAlert)
const permission$ = observeMediaPermission(audio)

const hash$ = observeHash()

const roomIds$ = hash$.pipe(map((hash) => hash.slice("#".length).split("/")))

const roomObjects$ = roomIds$.pipe(roomIdsToRooms(firestore))

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AudioProvider value={audio}>
      <MediaPermissionProvider value={permission$}>
        <Suspense fallback={<FullViewportProgress />}>
          <App roomObjects$={roomObjects$} />
        </Suspense>
      </MediaPermissionProvider>
    </AudioProvider>
  </StrictMode>
)
