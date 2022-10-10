import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./global.css"
import { FirestoreProvider } from "./useFirestore"

const firebaseApp = initializeApp({
  apiKey: "AIzaSyB02s7OAFZJwB8npC9OTmFJPLFCz-Ax1Rk",
  authDomain: "share-timer-2b51a.firebaseapp.com",
  projectId: "share-timer-2b51a",
  storageBucket: "share-timer-2b51a.appspot.com",
  messagingSenderId: "996149287532",
  appId: "1:996149287532:web:dd1dfe4c3ef583514bd649",
})

const firestore = getFirestore(firebaseApp)

createRoot(globalThis.document.getElementById("root")!).render(
  <StrictMode>
    <FirestoreProvider value={firestore}>
      <Suspense fallback={<progress title="hashが設定されるのを待っている" />}>
        <App />
      </Suspense>
    </FirestoreProvider>
  </StrictMode>
)
