import { filter, firstValueFrom } from "rxjs"
import Checkout from "./Checkout.svelte"
import { defineStart } from "./defineStart"
import { initRemoteAuth } from "./firestore/initRemoteAuth"
import { initRemoteFirestore } from "./firestore/initRemoteFirestore"
import type { SignInState } from "./firestore/worker/RemoteAuth.worker"
import { observeWorker } from "./util/observeWorker"
import { shareRecent } from "./util/shareRecent"

export default defineStart(async (target) => {
  const firestore = await initRemoteFirestore()

  const auth = await initRemoteAuth()

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

  const signInState = await firstValueFrom(authUser$)
  if (signInState === "not-signed-in") return

  const { uid, email } = signInState

  // TODO デバッグしてるだけなので消したい
  const x$ = observeWorker((onNext) =>
    firestore.onSnapshotCheckoutSession(uid, onNext)
  )
  x$.subscribe((_) => {
    console.log(_)
  })

  new Checkout({
    target,
    props: {
      uid,
      email,
      signOut() {
        auth.signOut()
      },
    },
  })
})
