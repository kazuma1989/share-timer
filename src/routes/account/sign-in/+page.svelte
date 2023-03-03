<script lang="ts" context="module">
  import type { Firebase, FirebaseUI } from "./types"

  declare const firebase: Firebase
  declare const firebaseui: FirebaseUI
</script>

<script lang="ts">
  import { browser } from "$app/environment"
  import Icon from "$lib/Icon.svelte"
  import clsx from "clsx"
  import UserInfo from "./UserInfo.svelte"

  const auth = () => firebase.auth()

  if (browser) {
    import("./defineFirebaseuiAuth").then((_) => {
      _.defineFirebaseuiAuth(firebase, firebaseui)
    })

    if (import.meta.env.VITE_AUTH_EMULATOR) {
      const { protocol, hostname } = window.location
      const port = import.meta.env.FIREBASE_EMULATORS.auth.port

      firebase.auth().useEmulator(`${protocol}//${hostname}:${port}`)
    }
  }
</script>

<svelte:head>
  <title>Share Timer Sign In</title>

  <script
    src="https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js"
  ></script>
  <script
    src="https://www.gstatic.com/firebasejs/9.15.0/firebase-auth-compat.js"
  ></script>
  <script src="/__/firebase/init.js"></script>

  <script
    src="https://www.gstatic.com/firebasejs/ui/6.0.2/firebase-ui-auth__ja.js"
  ></script>
</svelte:head>

<main class={clsx("mx-auto h-screen max-w-prose", "prose-theme-base", "px-6")}>
  <div class="h-0">
    <a
      title="タイマーに戻る"
      href="/"
      data-sveltekit-reload
      class="transparent-button my-2 -ml-4 inline-grid h-12 w-12 place-items-center text-2xl"
    >
      <Icon name="arrow-left" />
    </a>
  </div>

  <h1 class="mt-16">
    <ruby>
      Share Timer <rp>(</rp>
      <rt class="text-xs">シェア タイマー</rt>
      <rp>)</rp>
    </ruby>
  </h1>

  <p>URL でタイマーを簡単共有！</p>

  {#if browser}
    <div class="peer">
      <UserInfo auth={auth()} />
    </div>

    <firebaseui-auth class="peer-[:not(:empty)]:hidden my-14" />
  {/if}

  <!-- <p>
    <a
      href="/"
      target="_blank"
      class={clsx("transparent-button block border border-gray-500 px-4 py-3")}
    >
      新しいタイマーを開く
    </a>
  </p> -->
</main>
