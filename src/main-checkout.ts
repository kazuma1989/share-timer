import { wrap } from "comlink"
import { filter, firstValueFrom } from "rxjs"
import Checkout from "./Checkout.svelte"
import type {
  RemoteFirestore,
  SignInState,
} from "./firestore/worker/RemoteFirestore.worker"
import RemoteFirestoreWorker from "./firestore/worker/RemoteFirestore.worker?worker"
import { setTransferHandlers } from "./setTransferHandlers"
import { observeWorker } from "./util/observeWorker"
import { shareRecent } from "./util/shareRecent"

run()

async function run(): Promise<void> {
  const Firestore = wrap<typeof RemoteFirestore>(new RemoteFirestoreWorker())
  const firestore = await new Firestore(
    await fetch("/__/firebase/init.json").then((_) => _.json())
  )

  setTransferHandlers()

  const authUser$ = observeWorker<SignInState>((onNext) =>
    firestore.onAuthStateChanged(onNext)
  ).pipe(shareRecent())

  const notSignedIn$ = authUser$.pipe(filter((_) => _ === "not-signed-in"))
  notSignedIn$.subscribe(() => {
    location.assign(
      "/sign-in.html" +
        (import.meta.env.VITE_FIRESTORE_EMULATOR ? "?emulator" : "")
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
        firestore.signOut()
      },
    },
  })
}
