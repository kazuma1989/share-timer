/// <reference types="vitest" />
import react from "@vitejs/plugin-react"
import { defineConfig, Plugin } from "vite"

export default defineConfig(async ({ command, mode }) => {
  const { BROWSER, BUILD_PATH, HOST, PORT, PREVIEW_PORT } = process.env

  let checkerPlugin: Plugin | undefined
  if (command === "serve" && mode !== "production") {
    const checker = await import("vite-plugin-checker").then((m) => m.default)

    checkerPlugin = checker({
      typescript: true,
    })
  }

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

      // type-check
      checkerPlugin,
    ],

    // Vitest
    test: {
      setupFiles: ["./src/test.setup.ts"],
    },
  }
})
