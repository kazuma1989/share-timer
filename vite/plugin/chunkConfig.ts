import { Plugin, PluginOption } from "vite"

export default function chunkConfig(): PluginOption[] {
  return [alignGranularity(), vendorChunks()]
}

/**
 * チャンク粒度をある程度のファイルサイズに揃える
 */
function alignGranularity(): Plugin {
  return {
    name: "alignGranularity",

    config() {
      return {
        build: {
          // モジュールサイズが小さすぎると TTFB が律速するので、ある程度のかたまりを維持できるようにアセットをまとめる
          assetsInlineLimit: 4096 * 2,

          // CSS が細かくなりすぎるのでまとめる
          cssCodeSplit: false,
        },
      }
    },
  }
}

/**
 * node_modules 内の JS をある程度のかたまり（キャッシュヒットが期待でき、アセットリクエスト数が過剰にならない粒度）でチャンクにまとめる
 */
function vendorChunks(): Plugin {
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

                  case id.includes("/node_modules/zod"):
                    return "zod"
                }
              },
            },
          },
        },
      }
    },
  }
}
