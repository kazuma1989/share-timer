import { wrap } from "comlink"
import { filter, firstValueFrom } from "rxjs"
import Checkout from "./Checkout.svelte"
import type {
  RemoteAuth,
  SignInState,
} from "./firestore/worker/RemoteAuth.worker"
import RemoteAuthWorker from "./firestore/worker/RemoteAuth.worker?worker"
import type { RemoteFirestore } from "./firestore/worker/RemoteFirestore.worker"
import RemoteFirestoreWorker from "./firestore/worker/RemoteFirestore.worker?worker"
import { setTransferHandlers } from "./setTransferHandlers"
import { observeWorker } from "./util/observeWorker"
import { shareRecent } from "./util/shareRecent"

if (import.meta.env.DEV) {
  run()
}

async function run(): Promise<void> {
  const Firestore = wrap<typeof RemoteFirestore>(new RemoteFirestoreWorker())
  const firestore = await new Firestore(
    await fetch("/__/firebase/init.json").then((_) => _.json())
  )

  setTransferHandlers()

  const Auth = wrap<typeof RemoteAuth>(new RemoteAuthWorker())
  const auth = await new Auth(
    await fetch("/__/firebase/init.json").then((_) => _.json())
  )

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
    target: document.getElementById("root")!,
    props: {
      uid,
      email,
      signOut() {
        auth.signOut()
      },
    },
  })
}
