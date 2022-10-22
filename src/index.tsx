import { initializeApp } from "firebase/app"
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore"
import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { calibrateClock } from "./now"
import smallAlert from "./sound/small-alert.mp3"
import { AlertAudioProvider } from "./useAlertAudio"
import { FirestoreProvider } from "./useFirestore"

const firebaseApp = initializeApp(
  await fetch("/__/firebase/init.json").then((_) => _.json())
)
const firestore = getFirestore(firebaseApp)

if (import.meta.env.VITE_FIRESTORE_EMULATOR) {
  const host = location.hostname
  const port = Number(location.port)
  console.info(`using emulator (${host}:${port})`)

  connectFirestoreEmulator(firestore, host, port)
}

calibrateClock(firestore).catch((reason) => {
  console.warn("calibration failed", reason)
})

createRoot(globalThis.document.getElementById("root")!).render(
  <StrictMode>
    <FirestoreProvider value={firestore}>
      <AlertAudioProvider value={new Audio(smallAlert)}>
        <Suspense fallback={<FullViewportProgress />}>
          <App />
        </Suspense>
      </AlertAudioProvider>
    </FirestoreProvider>
  </StrictMode>
)
