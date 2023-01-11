import App from "./App.svelte"
import { firestoreImplContext } from "./firestore/firestoreImplContext"
import { initializeFirestore } from "./firestore/initializeFirestore"
import "./global.css"
import { observeAudioPermission } from "./observeAudioPermission"
import { observeHash } from "./observeHash"
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

  const firestore = await initializeFirestore()

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
