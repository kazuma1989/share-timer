import * as fs from "node:fs/promises"
import { Plugin } from "vite"

interface Firebaserc {
  projects: {
    default: string
  }
}

export function firebaseReservedURL(): Plugin {
  const firebaserc = () =>
    fs
      .readFile("./.firebaserc", { encoding: "utf-8" })
      .then<Firebaserc>(JSON.parse)
      .catch(() => null)

  return {
    name: "firebaseReservedURL",

    async config() {
      const rc = await firebaserc()
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

    /**
     * @see https://vitejs.dev/guide/api-plugin.html#universal-hooks
     * @see https://rollupjs.org/guide/en/#generatebundle
     * @see https://bundle-buddy.com/rollup
     */
    async generateBundle() {
      const rc = await firebaserc()
      if (!rc) return

      // @ts-expect-error Node.js 18にはfetchが生えているはずだ
      const initJSON = await fetch(
        `https://${rc.projects.default}.web.app` + "/__/firebase/init.json"
      ).then((_: any) => _.json())

      // https://rollupjs.org/guide/en/#thisemitfile
      this.emitFile({
        type: "asset",
        fileName: "__/firebase/init.json",
        source: JSON.stringify(initJSON, null, 2),
      })
    },
  }
}
