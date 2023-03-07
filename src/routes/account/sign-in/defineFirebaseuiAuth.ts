import type { Firebase, FirebaseUI } from "./types"

export function defineFirebaseuiAuth(
  firebase: Firebase,
  firebaseui: FirebaseUI
) {
  if (customElements.get("firebaseui-auth")) return

  customElements.define(
    "firebaseui-auth",
    class FirebaseuiAuth extends HTMLElement {
      constructor() {
        super()

        this.attachShadow({ mode: "open" })
      }

      async connectedCallback() {
        const shadowRoot = this.shadowRoot!

        const link = shadowRoot.appendChild(
          window.document.createElement("link")
        )
        link.rel = "stylesheet"
        link.href =
          "https://www.gstatic.com/firebasejs/ui/6.0.2/firebase-ui-auth.css"

        const linkLoaded$ = new Promise((resolve) => {
          link.onload = resolve
        })

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

        const container = shadowRoot.appendChild(
          window.document.createElement("div")
        )

        const ui =
          firebaseui.auth.AuthUI.getInstance() ??
          new firebaseui.auth.AuthUI(firebase.auth())

        await linkLoaded$

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
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
          ],
        })
      }
    }
  )
}
