<script lang="ts">
  import { GoogleAuthProvider, signInWithPopup, type Auth } from "firebase/auth"

  export let auth: Auth

  const signIn = async () => {
    const provider = new GoogleAuthProvider()
    const x = await signInWithPopup(auth, provider)

    console.log(x.operationType, x.user)

    location.assign("/")
  }
</script>

<div class="mx-auto grid h-screen max-w-prose place-items-center">
  <form class="contents" on:submit|preventDefault={signIn}>
    <button class="transparent-button border border-gray-500 px-4 py-3">
      Sign-in
    </button>
  </form>
</div>
