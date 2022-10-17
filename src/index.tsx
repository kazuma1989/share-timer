import { initializeApp } from "firebase/app"
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore"
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

if (import.meta.env.VITE_FIRESTORE_EMULATOR) {
  console.info("using emulator (localhost:8080)")
  connectFirestoreEmulator(firestore, "localhost", 8080)
}

calibrateClock(firestore).catch((reason) => {
  console.warn("calibration failed", reason)
})

createRoot(globalThis.document.getElementById("root")!).render(
  <StrictMode>
    <FirestoreProvider value={firestore}>
      <Suspense fallback={<FullViewportProgress />}>
        <App />
      </Suspense>
    </FirestoreProvider>
  </StrictMode>
)

import {
  getDocs,
  limitToLast,
  onSnapshot,
  query,
  startAt,
} from "firebase/firestore"
import {
  firstValueFrom,
  fromEventPattern,
  OperatorFunction,
  pairwise,
  share,
  startWith,
  timer,
} from "rxjs"
import { collection } from "./firestore/collection"
import { orderBy } from "./firestore/orderBy"
import { where } from "./firestore/where"

const db = firestore
const roomId = "A3VXRcrUtFVjyXQyuo9I"

const Empty = Symbol("empty")
type Empty = typeof Empty

const x = fromEventPattern<number>(
  (handler) => {
    console.count("subscribe")

    const abort = new AbortController()

    getDocs(
      query(
        collection(db, "rooms", roomId, "actions"),
        where("type", "==", "edit-done"),
        orderBy("createdAt", "asc"),
        limitToLast(1)
      )
    ).then((doc) => {
      if (abort.signal.aborted) return

      const _ = doc.docs[0]
      const serverTimestampCommitted =
        _ && !_.metadata.fromCache && !_.metadata.hasPendingWrites
      const startAtLatestEditDone = serverTimestampCommitted ? [startAt(_)] : []

      const unsubscribe = onSnapshot(
        query(
          collection(db, "rooms", roomId, "actions"),
          orderBy("createdAt", "asc"),
          ...startAtLatestEditDone
        ),
        (doc) => {
          console.debug("listen %d docChanges", doc.docChanges().length)

          if (doc.size === 1) {
            console.log(doc.docs.map((d) => d.data()))
          }
          handler(doc.size)
        }
      )

      abort.signal.addEventListener("abort", unsubscribe)
    })

    return () => {
      abort.abort()
    }
  },
  (_, abort) => {
    console.error("aborted!!")
    abort()
  }
).pipe(
  startWith(Empty),
  pairwise() as OperatorFunction<number | Empty, [number | Empty, number]>,
  share({
    // リスナーがいなくなって30秒後に根元の購読も解除する
    resetOnRefCountZero: () => timer(30_000),
  })
)

firstValueFrom(x).then((_) => {
  console.log("promise 1", _)

  globalThis.setTimeout(() => {
    const s = x.subscribe((_) => {
      console.log("in promise 1", _)
    })

    // console.time("resetOnRefCountZero")
    s.unsubscribe()
  }, 1_000)
})
