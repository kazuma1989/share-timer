import { doc } from "firebase/firestore"
import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import {
  distinctUntilChanged,
  fromEvent,
  map,
  of,
  partition,
  share,
  startWith,
  switchMap,
} from "rxjs"
import { collection } from "./firestore/collection"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { initializeFirestore } from "./initializeFirestore"
import { calibrateClock } from "./now"
import smallAlert from "./sound/small-alert.mp3"
import { AlertAudioProvider } from "./useAlertAudio"
import { FirestoreProvider } from "./useFirestore"
import { replaceHash } from "./useHash"
import { setupRoom } from "./useRoom"
import { checkAudioPermission } from "./util/checkAudioPermission"
import { snapshotOf } from "./util/snapshotOf"
import { sparse } from "./util/sparse"
import { Room, roomIdZod, roomZod } from "./zod/roomZod"

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
        <Suspense fallback={<FullViewportProgress />}>{/* <App /> */}</Suspense>
      </AlertAudioProvider>
    </FirestoreProvider>
  </StrictMode>
)

const db = firestore

const hash$ = fromEvent(window, "hashchange" as keyof WindowEventMap, {
  passive: true,
}).pipe(
  startWith(null),
  map(() => window.location.hash),
  distinctUntilChanged()
)

const [room$, invalidRoom$] = partition(
  hash$.pipe(
    map((hash) => roomIdZod.safeParse(hash.slice("#".length))),
    switchMap((_) => {
      if (!_.success) {
        return of<["invalid-id"]>(["invalid-id"])
      }

      const roomId = _.data

      return snapshotOf(doc(collection(db, "rooms"), roomId)).pipe(
        map((doc): Room | ["invalid-doc", Room["id"]] => {
          const _ = roomZod.safeParse(doc.data())
          if (!_.success) {
            return ["invalid-doc", roomId]
          }

          return {
            ..._.data,
            id: roomId,
          }
        })
      )
    }),
    share()
  ),
  (_): _ is Room =>
    !Array.isArray(_) || (_[0] !== "invalid-id" && _[0] !== "invalid-doc")
)

let invalidCount = 0

invalidRoom$.pipe(sparse(200)).subscribe(async (reason) => {
  invalidCount += 1
  if (invalidCount >= 10) {
    throw new Error("Detect hash change loop. Something went wrong")
  }

  const [type] = reason
  switch (type) {
    case "invalid-id": {
      const newRoomId = roomIdZod.parse(doc(collection(db, "rooms")).id)
      replaceHash(newRoomId)
      break
    }

    case "invalid-doc": {
      const [, roomId] = reason
      await setupRoom(db, roomId)
      break
    }
  }
})

room$.subscribe((room) => {
  invalidCount = 0
  console.log(room)
})
