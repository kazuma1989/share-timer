import react from "@vitejs/plugin-react"
import { defineConfig, UserConfig } from "vite"
import { getChecker } from "./vite/getChecker"
import bundleBuddy from "./vite/plugin/bundleBuddy"
import firebaseReservedURL from "./vite/plugin/firebaseReservedURL"
import firestoreEmulatorProxy from "./vite/plugin/firestoreEmulatorProxy"
import vendorChunks from "./vite/plugin/vendorChunks"
import vitest from "./vite/plugin/vitest"

export default defineConfig(async ({ command, mode }): Promise<UserConfig> => {
  const { BROWSER, BUILD_PATH, HOST, PORT, PREVIEW_PORT } = process.env

  return {
    server: {
      // localhost 以外で起動したい場合は指定する。
      host: HOST || "localhost",

      // Create React App のデフォルトのポートと同じにする。
      port: (PORT && parseInt(PORT)) || 3000,

      // 自動でブラウザーを開きたくないときは open=false を指定する。
      // もしくは CLI オプションで `--no-open` を渡す。
      // (e.g.) $ npm start -- --no-open
      open: BROWSER || true,
    },

    build: {
      // Support top-level await
      // https://caniuse.com/mdn-javascript_operators_await_top_level
      target: ["chrome89", "edge89", "safari15", "firefox89", "opera75"],

      // Create React App のデフォルトの出力先と同じにする。
      outDir: BUILD_PATH || "./build/",

      // デバッグのためソースマップを有効にしておく。
      sourcemap: true,
    },

    preview: {
      // ポートが衝突したら自動でインクリメントしてくれるので問題ない。
      port: (PREVIEW_PORT && parseInt(PREVIEW_PORT)) || 3000,
    },

    plugins: [
      // The all-in-one Vite plugin for React projects.
      react(),

      // Firebase
      firebaseReservedURL(),
      firestoreEmulatorProxy(),

      // Chunks
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
