import * as fs from "node:fs/promises"
import { PluginOption } from "vite"

interface Firebaserc {
  projects: {
    default: string
  }
}

export async function firebaseReservedURL(): Promise<PluginOption> {
  const firebaserc = await fs
    .readFile("./.firebaserc", { encoding: "utf-8" })
    .then<Firebaserc>(JSON.parse)
    .catch(() => null)

  if (!firebaserc) {
    return null
  }

  const domain = `https://${firebaserc.projects.default}.web.app`

  return {
    name: "firebaseReservedURL",

    config() {
      return {
        server: {
          proxy: {
            "/__": {
              target: domain,
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
      // @ts-expect-error Node.js 18にはfetchが生えているはずだ
      const initJSON = await fetch(domain + "/__/firebase/init.json").then(
        (_: any) => _.json()
      )

      // https://rollupjs.org/guide/en/#thisemitfile
      this.emitFile({
        type: "asset",
        fileName: "__/firebase/init.json",
        source: JSON.stringify(initJSON, null, 2),
      })
    },
  }
}
