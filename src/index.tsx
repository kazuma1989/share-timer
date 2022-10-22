import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { initializeFirestore } from "./initializeFirestore"
import { calibrateClock } from "./now"
import smallAlert from "./sound/small-alert.mp3"
import { AlertAudioProvider } from "./useAlertAudio"
import { FirestoreProvider } from "./useFirestore"
import { checkAudioPermission } from "./util/checkAudioPermission"

const firestore = await initializeFirestore()

calibrateClock(firestore).catch((reason) => {
  console.warn("calibration failed", reason)
})

const audio = new Audio(smallAlert)

document.body.addEventListener(
  "click",
  async () => {
    const permission = await checkAudioPermission(audio)
    if (permission === "denied") {
      console.warn("Cannot play audio")
    }
  },
  {
    passive: true,
    once: true,
  }
)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FirestoreProvider value={firestore}>
      <AlertAudioProvider value={audio}>
        <Suspense fallback={<FullViewportProgress />}>
          <App />
        </Suspense>
      </AlertAudioProvider>
    </FirestoreProvider>
  </StrictMode>
)
