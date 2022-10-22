/// <reference types="vitest" />
import react from "@vitejs/plugin-react"
import { defineConfig, UserConfig } from "vite"
import { getChecker } from "./vite/getChecker"
import { bundleBuddy } from "./vite/plugin/bundleBuddy"
import { firebaseReservedURL } from "./vite/plugin/firebaseReservedURL"
import { firestoreEmulatorProxy } from "./vite/plugin/firestoreEmulatorProxy"

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

      rollupOptions: {
        output: {
          manualChunks(id) {
            switch (true) {
              case id.includes("/node_modules/@firebase"):
              case id.includes("/node_modules/firebase"):
                return "firebase"

              case id.includes("/node_modules/react"):
                return "react"

              case id.includes("/node_modules/zod"):
                return "zod"
            }
          },
        },
      },
    },

    preview: {
      // ポートが衝突したら自動でインクリメントしてくれるので問題ない。
      port: (PREVIEW_PORT && parseInt(PREVIEW_PORT)) || 3000,
    },

    define: {
      // https://vitest.dev/guide/in-source.html#production-build
      "import.meta.vitest": "undefined",
    },

    plugins: [
      // The all-in-one Vite plugin for React projects.
      react(),

      // Firebase
      firebaseReservedURL(),
      firestoreEmulatorProxy(),

      // type-check
      command === "serve" && mode === "development"
        ? await getChecker()
        : undefined,

      // bundle analyze
      bundleBuddy(),
    ],

    // Vitest
    test: {
      setupFiles: ["./src/test.setup.ts"],
      includeSource: ["./src/**/*.{ts,tsx}"],
    },
  }
})
