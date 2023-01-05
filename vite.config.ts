import react from "@vitejs/plugin-react"
import { defineConfig, UserConfig } from "vite"
import { hosting } from "./firebase.json"
import { getChecker } from "./vite/getChecker"
import bundleBuddy from "./vite/plugin/bundleBuddy"
import firebaseReservedURL from "./vite/plugin/firebaseReservedURL"
import firestoreEmulatorProxy from "./vite/plugin/firestoreEmulatorProxy"
import vendorChunks from "./vite/plugin/vendorChunks"
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
    },

    preview: {
      // ポートが衝突したら自動でインクリメントしてくれる
      port: (PREVIEW_PORT && parseInt(PREVIEW_PORT)) || 3000,
    },

    plugins: [
      // The all-in-one Vite plugin for React projects.
      react(),

      // Firebase
      firebaseReservedURL(),
      firestoreEmulatorProxy(),

      // Build config
      vendorChunks(),

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
