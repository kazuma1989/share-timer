import { wrap } from "comlink"
import { filter, firstValueFrom } from "rxjs"
import App from "./App.svelte"
import AppSkeleton from "./AppSkeleton.svelte"
import { firestoreImplContext } from "./firestore/firestoreImplContext"
import type {
  RemoteAuth,
  SignInState,
} from "./firestore/worker/RemoteAuth.worker"
import RemoteAuthWorker from "./firestore/worker/RemoteAuth.worker?worker"
import type { RemoteFirestore } from "./firestore/worker/RemoteFirestore.worker"
import RemoteFirestoreWorker from "./firestore/worker/RemoteFirestore.worker?worker"
import { observeAudioPermission } from "./observeAudioPermission"
import { observeHash } from "./observeHash"
import { setTransferHandlers } from "./setTransferHandlers"
import smallAlert from "./sound/small-alert.mp3"
import { getItem, setItem } from "./storage"
import { createAudio, keyWithAudio, keyWithMediaPermission } from "./useAudio"
import { keyWithDarkMode, observeDarkMode } from "./useDarkMode"
import { nanoid } from "./util/nanoid"
import { observeWorker } from "./util/observeWorker"
import { shareRecent } from "./util/shareRecent"

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

  const Auth = wrap<typeof RemoteAuth>(new RemoteAuthWorker())
  const auth = await new Auth(
    await fetch("/__/firebase/init.json").then((_) => _.json())
  )

  setTransferHandlers()
  // firestore.getEstimatedDiff().then(setEstimatedDiff)

  const authUser$ = observeWorker<SignInState>((onNext) =>
    auth.onAuthStateChanged(onNext)
  ).pipe(shareRecent())

  const notSignedIn$ = authUser$.pipe(filter((_) => _ === "not-signed-in"))
  notSignedIn$.subscribe(() => {
    location.assign(
      "/sign-in.html" +
        (import.meta.env.VITE_FIRESTORE_EMULATOR
          ? `?emulator=${import.meta.env.FIREBASE_EMULATORS.auth.port}`
          : "")
    )
  })

  await firstValueFrom(authUser$)

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
