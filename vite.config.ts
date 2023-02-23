import { svelte } from "@sveltejs/vite-plugin-svelte"
import { defineConfig, UserConfig } from "vite"
import { emulators, hosting } from "./firebase.json"
import { getChecker } from "./vite/getChecker"
import bundleBuddy from "./vite/plugin/bundleBuddy"
import chunkAlignGranularity from "./vite/plugin/chunkAlignGranularity"
import firebaseReservedURL from "./vite/plugin/firebaseReservedURL"
import prefetchWorker from "./vite/plugin/prefetchWorker"
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

    BUILD_PATH?: string
    HOST?: string
    PORT?: string
    PREVIEW_PORT?: string

    CI?: "true"
  }
}

export default defineConfig(async ({ command, mode }): Promise<UserConfig> => {
  const { BROWSER, BUILD_PATH, HOST, PORT, PREVIEW_PORT, CI } = process.env

  return {
    appType: "mpa",

    define: {
      "import.meta.env.FIREBASE_EMULATORS": JSON.stringify(emulators),
    },

    server: {
      host: HOST || "localhost",
      port: (PORT && Number.parseInt(PORT)) || 3000,
      open: BROWSER || true,
    },

    build: {
      outDir: BUILD_PATH || hosting.find((_) => _.target === "app")?.public,
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
      svelte(),

      // Firebase
      firebaseReservedURL(),

      // Build config
      chunkAlignGranularity(),
      prefetchWorker(),

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
