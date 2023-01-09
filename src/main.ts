import App from "./App.svelte"
import { firestoreImplContext } from "./firestore/firestoreImplContext"
import { initializeFirestore } from "./firestore/initializeFirestore"
import "./global.css"
import { observeHash } from "./observeHash"
import { keyWithDarkMode, observeDarkMode } from "./useDarkMode"

run()

async function run() {
  // https://neos21.net/blog/2018/08/19-01.html
  document.body.addEventListener("touchstart", () => {}, { passive: true })

  const darkMode$ = observeDarkMode()

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
    ]),
  })
}
