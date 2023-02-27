<script lang="ts">
  import { browser } from "$app/environment"
  import { filter, firstValueFrom } from "rxjs"
  import { initRemoteAuth } from "../../firestore/initRemoteAuth"
  import { initRemoteFirestore } from "../../firestore/initRemoteFirestore"
  import type { SignInState } from "../../firestore/worker/RemoteAuth.worker"
  import { observeWorker } from "../../util/observeWorker"
  import { shareRecent } from "../../util/shareRecent"
  import Checkout from "./Checkout.svelte"

  const props$ = (async () => {
    if (!browser) throw "client-side only context"

    const firestore = await initRemoteFirestore()

    const auth = await initRemoteAuth()

    const authUser$ = observeWorker<SignInState>((onNext) =>
      auth.onAuthStateChanged(onNext)
    ).pipe(shareRecent())

    const notSignedIn$ = authUser$.pipe(filter((_) => _ === "not-signed-in"))
    notSignedIn$.subscribe(() => {
      window.location.assign(
        "/sign-in.html" +
          (import.meta.env.VITE_FIRESTORE_EMULATOR
            ? `?emulator=${import.meta.env.FIREBASE_EMULATORS.auth.port}`
            : "")
      )
    })

    const signInState = await firstValueFrom(authUser$)
    if (signInState === "not-signed-in") {
      throw "not-signed-in"
    }

    const { uid, email } = signInState

    // TODO デバッグしてるだけなので消したい
    const x$ = observeWorker((onNext) =>
      firestore.onSnapshotCheckoutSession(uid, onNext)
    )
    x$.subscribe((_) => {
      console.log(_)
    })

    return {
      uid,
      email,
      signOut() {
        auth.signOut()
      },
    }
  })()
</script>

{#await props$ then props}
  <Checkout {...props} />
{/await}
