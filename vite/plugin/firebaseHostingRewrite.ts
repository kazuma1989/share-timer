import { Plugin } from "vite"
import { getFirebaserc } from "../getFirebaserc"

/**
 * firebase.json の hosting.rewrites をできるだけエミュレートする
 */
export default function firebaseHostingRewrite(): Plugin {
  return {
    name: "firebaseHostingRewrite",

    async config() {
      const rc = await getFirebaserc()
      if (!rc) return

      const {
        hosting: [hosting],
      } = await import("../../firebase.json")
      if (!hosting) return

      return {
        server: {
          proxy: Object.fromEntries(
            hosting.rewrites.map(({ source, function: target }) => [
              source,
              {
                target: `http://127.0.0.1:5001/${rc.projects.default}/us-central1/${target}`,
                changeOrigin: true,
              },
            ])
          ),
        },
      }
    },
  }
}
