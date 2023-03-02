<script lang="ts">
  import { browser } from "$app/environment"
  import Icon from "$lib/Icon.svelte"
  import clsx from "clsx"
  import SignIn from "./SignIn.svelte"
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
  <script>
    const port = Number(
      new URLSearchParams(window.location.search).get("emulator")
    )
    if (port) {
      const { protocol, hostname } = window.location

      firebase.auth().useEmulator(`${protocol}//${hostname}:${port}`)
    }

    customElements.define(
      "firebaseui-auth",
      class FirebaseuiAuth extends HTMLElement {
        constructor() {
          super()

          const shadowRoot = this.attachShadow({ mode: "open" })

          const link = shadowRoot.appendChild(
            window.document.createElement("link")
          )
          link.rel = "stylesheet"
          link.href =
            "https://www.gstatic.com/firebasejs/ui/6.0.2/firebase-ui-auth.css"

          const style = shadowRoot.appendChild(
            window.document.createElement("style")
          )
          style.textContent = `
            :host {
              display: block;
            }
            button:focus {
              /* https://css-tricks.com/copy-the-browsers-native-focus-styles/ */
              outline: Highlight auto medium;
              outline: -webkit-focus-ring-color auto medium;
            }
          `

          const ui = new firebaseui.auth.AuthUI(firebase.auth())
          const container = shadowRoot.appendChild(
            window.document.createElement("div")
          )

          ui.start(container, {
            signInSuccessUrl:
              new URLSearchParams(window.location.search).get("back") ||
              window.location.href,
            signInOptions: [
              firebase.auth.GoogleAuthProvider.PROVIDER_ID,
              // "apple.com",
              // "microsoft.com",
              // "yahoo.com",
              // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
              // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
              // firebase.auth.GithubAuthProvider.PROVIDER_ID,
              // firebase.auth.EmailAuthProvider.PROVIDER_ID,
              // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
              // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
            ],
          })
        }
      }
    )
  </script>
</svelte:head>

<main class={clsx("mx-auto h-screen max-w-prose", "prose-theme-base", "px-6")}>
  <div class="h-0">
    <a
      title="タイマーに戻る"
      href="/"
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

  <div class="peer">
    {#if browser}
      <SignIn />
    {/if}
  </div>

  <firebaseui-auth class="peer-[:not(:empty)]:hidden" />

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
