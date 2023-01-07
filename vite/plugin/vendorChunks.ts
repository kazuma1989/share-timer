import { Plugin } from "vite"

/**
 * node_modules 内の JS をある程度のかたまり（キャッシュヒットが期待でき、アセットリクエスト数が過剰にならない粒度）でチャンクにまとめる
 */
export default function vendorChunks(): Plugin {
  return {
    name: "vendorChunks",

    config() {
      return {
        build: {
          rollupOptions: {
            output: {
              manualChunks(id) {
                switch (true) {
                  case id.includes("/node_modules/@firebase"):
                  case id.includes("/node_modules/firebase"):
                    return "firebase"
                }
              },
            },
          },
        },
      }
    },
  }
}
