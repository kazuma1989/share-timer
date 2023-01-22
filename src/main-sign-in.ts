import { initializeApp } from "firebase/app"
import {
  browserPopupRedirectResolver,
  connectAuthEmulator,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  signInWithPopup,
} from "firebase/auth"

run()

async function run(): Promise<void> {
  // https://neos21.net/blog/2018/08/19-01.html
  document.body.addEventListener("touchstart", () => {}, { passive: true })

  const firebaseApp = initializeApp(
    await fetch("/__/firebase/init.json").then((_) => _.json())
  )

  const auth = initializeAuth(firebaseApp, {
    persistence: indexedDBLocalPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  })

  // TODO VITE_FIRESTORE_EMULATOR を間借りするのではなく専用の定数を用意するべき
  if (import.meta.env.VITE_FIRESTORE_EMULATOR) {
    const protocol = location.protocol
    const host = location.hostname

    connectAuthEmulator(auth, `${protocol}//${host}:9099`)
  }

  const provider = new GoogleAuthProvider()
  const x = await signInWithPopup(auth, provider)

  console.log(x.operationType, x.user)
}
