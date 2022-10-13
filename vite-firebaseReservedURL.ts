import * as fs from "node:fs/promises"
import { Plugin } from "vite"

export function firebaseReservedURL(): Plugin {
  interface Firebaserc {
    projects: {
      default: string
    }
  }
  const getFirebaserc = () =>
    fs
      .readFile("./.firebaserc", { encoding: "utf-8" })
      .then<Firebaserc>(JSON.parse)
      .catch(() => null)

  return {
    name: "firebaseReservedURL",

    async config() {
      const rc = await getFirebaserc()
      if (!rc) return

      return {
        server: {
          proxy: {
            "/__": {
              target: `https://${rc.projects.default}.web.app`,
              changeOrigin: true,
            },
          },
        },
      }
    },
  }
}
