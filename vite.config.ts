import { svelte } from "@sveltejs/vite-plugin-svelte"
import * as path from "node:path"
import { defineConfig, UserConfig } from "vite"
import { hosting } from "./firebase.json"
import { getChecker } from "./vite/getChecker"
import bundleBuddy from "./vite/plugin/bundleBuddy"
import chunkAlignGranularity from "./vite/plugin/chunkAlignGranularity"
import firebaseReservedURL from "./vite/plugin/firebaseReservedURL"
import firestoreEmulatorProxy from "./vite/plugin/firestoreEmulatorProxy"
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
  }
}

export default defineConfig(async ({ command, mode }): Promise<UserConfig> => {
  const { BROWSER, BUILD_PATH, HOST, PORT, PREVIEW_PORT } = process.env

  return {
    appType: "mpa",

    server: {
      host: HOST || "localhost",
      port: (PORT && Number.parseInt(PORT)) || 3000,
      open: BROWSER || true,
    },

    build: {
      outDir: BUILD_PATH || hosting.find((_) => _.target === "app")?.public,
      sourcemap: true,

      rollupOptions: {
        input: {
          index: path.resolve(__dirname, "index.html"),
          "sign-in": path.resolve(__dirname, "sign-in.html"),
        },
      },
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
      firestoreEmulatorProxy(),

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
      bundleBuddy(),
    ],
  }
})
