import * as fs from "node:fs/promises"
import * as path from "node:path"
import { Plugin } from "vite"

interface Firebaserc {
  projects: {
    default: string
  }
}

/**
 * firebase.json の hosting.rewrites をできるだけエミュレートする
 */
export default function firebaseHostingRewrite(): Plugin {
  const getFirebaserc = () =>
    fs
      .readFile(path.join(__dirname, "../../.firebaserc"), {
        encoding: "utf-8",
      })
      .then<Firebaserc>(JSON.parse)
      .catch(() => null)

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
