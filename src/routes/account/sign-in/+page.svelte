<script lang="ts">
  import { browser } from "$app/environment"
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
      const protocol = window.location.protocol
      const host = window.location.hostname

      firebase.auth().useEmulator(`${protocol}//${host}:${port}`)
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

<header class="text-center">
  <h1>Share Timer</h1>
</header>

<div class="peer">
  {#if browser}
    <SignIn />
  {/if}
</div>

<firebaseui-auth class="peer-[:not(:empty)]:hidden" />
