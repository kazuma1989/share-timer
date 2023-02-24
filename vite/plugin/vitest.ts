/// <reference types="vitest" />
import * as path from "node:path"
import type { Plugin } from "vite"

/**
 * Vitest を使えるようにする
 */
export default function vitest(): Plugin {
  return {
    name: "vitest",

    config(_, { mode }) {
      return {
        test: {
          setupFiles: [path.join(__dirname, "../../src/test.setup.ts")],
          includeSource: [path.join(__dirname, "../../src/**/*.{ts,svelte}")],
        },

        define: {
          ...(mode !== "test"
            ? {
                // https://vitest.dev/guide/in-source.html#production-build
                "import.meta.vitest": "undefined",
              }
            : {}),
        },
      }
    },
  }
}
