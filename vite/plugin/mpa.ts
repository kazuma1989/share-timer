import * as fs from "node:fs/promises"
import * as path from "node:path"
import type { Plugin } from "vite"

export default function mpa(): Plugin {
  return {
    name: "mpa",

    async config() {
      const projectRoot = path.resolve(__dirname, "../..")

      const rootHtmlFiles = await fs
        .readdir(projectRoot)
        .then((_) =>
          _.filter((_) => _.endsWith(".html")).map((_) =>
            path.resolve(projectRoot, _)
          )
        )

      return {
        appType: "mpa",

        build: {
          rollupOptions: {
            input: rootHtmlFiles,
          },
        },
      }
    },
  }
}
