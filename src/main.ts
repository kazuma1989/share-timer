import App from "./App.svelte"
import { firestoreImplContext } from "./firestore/firestoreImplContext"
import { initializeFirestore } from "./firestore/initializeFirestore"
import "./global.css"
import { observeHash } from "./observeHash"

const route$ = observeHash()

const firestore = await initializeFirestore()

new App({
  target: document.getElementById("root")!,
  props: {
    route$,
  },
  context: firestoreImplContext(firestore),
})
