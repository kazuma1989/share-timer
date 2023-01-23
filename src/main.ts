import { proxy, wrap } from "comlink"
import { firstValueFrom, Observable } from "rxjs"
import App from "./App.svelte"
import AppSkeleton from "./AppSkeleton.svelte"
import { firestoreImplContext } from "./firestore/firestoreImplContext"
import type {
  RemoteFirestore,
  SignInState,
} from "./firestore/worker/RemoteFirestore.worker"
import RemoteFirestoreWorker from "./firestore/worker/RemoteFirestore.worker?worker"
import { observeAudioPermission } from "./observeAudioPermission"
import { observeHash } from "./observeHash"
import { setTransferHandlers } from "./setTransferHandlers"
import smallAlert from "./sound/small-alert.mp3"
import { getItem, setItem } from "./storage"
import { createAudio, keyWithAudio, keyWithMediaPermission } from "./useAudio"
import { keyWithDarkMode, observeDarkMode } from "./useDarkMode"
import { nanoid } from "./util/nanoid"

run()

async function run(): Promise<void> {
  const skeleton = new AppSkeleton({
    target: document.getElementById("root")!,
  })

  // https://neos21.net/blog/2018/08/19-01.html
  document.body.addEventListener("touchstart", () => {}, { passive: true })

  if (!getItem("userId")) {
    setItem("userId", nanoid(10))
  }

  const darkMode$ = observeDarkMode()

  const context = new AudioContext()
  const permission$ = observeAudioPermission(context)

  const audioData = await fetch(smallAlert).then((_) => _.arrayBuffer())
  const audio = createAudio(context, audioData)

  const route$ = observeHash()

  const Firestore = wrap<typeof RemoteFirestore>(new RemoteFirestoreWorker())
  const firestore = await new Firestore(
    await fetch("/__/firebase/init.json").then((_) => _.json())
  )

  setTransferHandlers()
  // firestore.getEstimatedDiff().then(setEstimatedDiff)

  const authUser$ = new Observable<SignInState>((subscriber) => {
    const unsubscribe$ = firestore.onAuthStateChanged(
      proxy((data) => {
        subscriber.next(data)
      })
    )

    return async () => {
      const unsubscribe = await unsubscribe$
      unsubscribe()
    }
  })

  if ((await firstValueFrom(authUser$)) === "not-signed-in") {
    location.assign(
      "/sign-in.html" +
        (import.meta.env.VITE_FIRESTORE_EMULATOR ? "?emulator" : "")
    )
    return
  }

  new App({
    target: skeleton.appRoot!,
    props: {
      route$,
    },
    context: new Map([
      ...firestoreImplContext(firestore),
      keyWithAudio(audio),
      keyWithMediaPermission(permission$),
      keyWithDarkMode(darkMode$),
    ]),
  })
}
