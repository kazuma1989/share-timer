import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import { firebaseOptions } from "./firebaseOptions"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { FirestoreProvider } from "./useFirestore"

const firebaseApp = initializeApp(firebaseOptions)
const firestore = getFirestore(firebaseApp)

createRoot(globalThis.document.getElementById("root")!).render(
  <StrictMode>
    <FirestoreProvider value={firestore}>
      <Suspense fallback={<FullViewportProgress />}>
        <App />
      </Suspense>
    </FirestoreProvider>
  </StrictMode>
)
