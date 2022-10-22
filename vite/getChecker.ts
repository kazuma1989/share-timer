import { Plugin } from "vite"

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
