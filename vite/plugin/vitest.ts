/// <reference types="vitest" />
import { Plugin } from "vite"

/**
 * Vitest を使えるようにする
 */
export default function vitest(): Plugin {
  return {
    name: "vitest",

    config() {
      return {
        test: {
          setupFiles: ["./src/test.setup.ts"],
          includeSource: ["./src/**/*.{ts,tsx}"],
        },

        define: {
          // https://vitest.dev/guide/in-source.html#production-build
          "import.meta.vitest": "undefined",
        },
      }
    },
  }
}
