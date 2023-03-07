import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"
import { emulators } from "./firebase.json"
import { getChecker } from "./vite/getChecker"
import bundleBuddy from "./vite/plugin/bundleBuddy"
import chunkAlignGranularity from "./vite/plugin/chunkAlignGranularity"
import vitest from "./vite/plugin/vitest"

declare const process: {
  env: {
    /**
     * 自動でブラウザーを開きたくないときは BROWSER=none を指定する。
     * もしくは CLI オプションで `--no-open` を渡す。
     * (e.g.) $ BROWSER=none npm start
     * (e.g.) $ npm start -- --no-open
     */
    BROWSER?: string

    HOST?: string
    PORT?: string
    PREVIEW_PORT?: string

    CI?: "true"
  }
}

export default defineConfig(async ({ command, mode }) => {
  const { BROWSER, HOST, PORT, PREVIEW_PORT, CI } = process.env

  return {
    define: {
      "import.meta.env.FIREBASE_EMULATORS": JSON.stringify(emulators),
    },

    server: {
      host: HOST || "localhost",
      port: (PORT && Number.parseInt(PORT)) || 3000,
      open: BROWSER || true,
    },

    build: {
      sourcemap: true,
    },

    esbuild: {
      legalComments: "external",
    },

    preview: {
      // ポートが衝突したら自動でインクリメントしてくれる
      port: (PREVIEW_PORT && parseInt(PREVIEW_PORT)) || 3000,
    },

    plugins: [
      sveltekit(),

      // Build config
      chunkAlignGranularity(),

      // Test config
      vitest(),

      // type-check
      command === "serve" && mode === "development"
        ? await getChecker()
        : undefined,

      // bundle analyze
      !CI && bundleBuddy(),
    ],
  }
})
