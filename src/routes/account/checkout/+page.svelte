<script lang="ts">
  import { browser } from "$app/environment"
  import { page } from "$app/stores"
  import { initRemoteAuth } from "$lib/firestore/initRemoteAuth"
  import type { SignInState } from "$lib/firestore/worker/RemoteAuth.worker"
  import { observeWorker } from "$lib/util/observeWorker"
  import { shareRecent } from "$lib/util/shareRecent"
  import { filter, firstValueFrom } from "rxjs"
  import type { PageData } from "./$types"
  import Checkout from "./Checkout.svelte"

  export let data: PageData

  const props$ = (async () => {
    if (!browser) throw "client-side only context"

    const auth = await initRemoteAuth()

    const authUser$ = observeWorker<SignInState>((onNext) =>
      auth.onAuthStateChanged(onNext)
    ).pipe(shareRecent())

    const notSignedIn$ = authUser$.pipe(filter((_) => _ === "not-signed-in"))
    notSignedIn$.subscribe(() => {
      const { pathname, search, hash } = $page.url

      window.location.assign(
        "/account/sign-in/" +
          "?" +
          new URLSearchParams({
            back: pathname + search + hash,
          })
      )
    })

    const signInState = await firstValueFrom(authUser$)
    if (signInState === "not-signed-in") {
      throw "not-signed-in"
    }

    const { uid, email } = signInState

    // TODO デバッグしてるだけなので消したい
    const x$ = observeWorker((onNext) =>
      data.firestore!.onSnapshotCheckoutSession(uid, onNext)
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
