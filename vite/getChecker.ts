import { Plugin } from "vite"

/**
 * 設定ずみの vite-plugin-checker を返す
 *
 * lint コマンドは package.json の `scripts.lint`
 */
export async function getChecker(): Promise<Plugin> {
  const [checker, { scripts }] = await Promise.all([
    import("vite-plugin-checker").then((_) => _.default),
    import("../package.json"),
  ])

  return checker({
    typescript: true,
    eslint: {
      lintCommand: scripts["lint"],
      dev: {
        logLevel: ["error"],
      },
    },
  })
}
