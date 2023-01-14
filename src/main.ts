import { wrap } from "comlink"
import App from "./App.svelte"
import { firestoreImplContext } from "./firestore/firestoreImplContext"
import type { RemoteFirestore } from "./firestore/RemoteFirestore.worker"
import RemoteFirestoreWorker from "./firestore/RemoteFirestore.worker?worker"
import { observeAudioPermission } from "./observeAudioPermission"
import { observeHash } from "./observeHash"
import { setTransferHandlers } from "./setTransferHandlers"
import { keyWithMediaPermission } from "./useAudio"
import { keyWithDarkMode, observeDarkMode } from "./useDarkMode"

run()

async function run() {
  // https://neos21.net/blog/2018/08/19-01.html
  document.body.addEventListener("touchstart", () => {}, { passive: true })

  const darkMode$ = observeDarkMode()

  const context = new AudioContext()
  const permission$ = observeAudioPermission(context)

  const route$ = observeHash()

  setTransferHandlers()

  const Firestore = wrap<typeof RemoteFirestore>(new RemoteFirestoreWorker())
  const firestore = await new Firestore(
    await fetch("/__/firebase/init.json").then((_) => _.json())
  )

  firestore.log({
    x: Symbol.for("serverTimestamp"),
  })

  new App({
    target: document.getElementById("root")!,
    props: {
      route$,
    },
    context: new Map([
      ...firestoreImplContext(firestore),
      keyWithDarkMode(darkMode$),
      keyWithMediaPermission(permission$),
    ]),
  })
}
