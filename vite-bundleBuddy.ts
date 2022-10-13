import { Plugin } from "vite"

/**
 * https://bundle-buddy.com で分析するための graph.json を生成する
 */
export function bundleBuddy(): Plugin {
  return {
    name: "bundleBuddy",

    /**
     * @see https://vitejs.dev/guide/api-plugin.html#universal-hooks
     * @see https://rollupjs.org/guide/en/#generatebundle
     * @see https://bundle-buddy.com/rollup
     */
    generateBundle() {
      // https://bundle-buddy.com/rollup
      const deps = []
      for (const id of this.getModuleIds()) {
        const m = this.getModuleInfo(id)
        if (m != null && !m.isExternal) {
          for (const target of m.importedIds) {
            deps.push({ source: m.id, target })
          }
        }
      }

      // https://rollupjs.org/guide/en/#thisemitfile
      this.emitFile({
        type: "asset",
        fileName: ".graph.json",
        source: JSON.stringify(deps, null, 2),
      })
    },
  }
}
