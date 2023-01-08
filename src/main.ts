import App from "./App.svelte"
import { firestoreImplContext } from "./firestore/firestoreImplContext"
import "./global.css"
import { observeHash } from "./observeHash"

const route$ = observeHash()

new App({
  target: document.getElementById("root")!,
  props: {
    route$,
  },
  context: firestoreImplContext,
})
