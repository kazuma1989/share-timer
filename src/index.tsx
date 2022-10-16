import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { calibrateClock } from "./now"
import { FirestoreProvider } from "./useFirestore"

const firebaseApp = initializeApp(
  await fetch("/__/firebase/init.json").then((_) => _.json())
)
const firestore = getFirestore(firebaseApp)

calibrateClock(firestore)

createRoot(globalThis.document.getElementById("root")!).render(
  <StrictMode>
    <FirestoreProvider value={firestore}>
      <Suspense fallback={<FullViewportProgress />}>
        <App />
      </Suspense>
    </FirestoreProvider>
  </StrictMode>
)
