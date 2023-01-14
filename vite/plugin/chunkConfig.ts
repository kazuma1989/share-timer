import { Plugin, PluginOption } from "vite"

export default function chunkConfig(): PluginOption[] {
  return [alignGranularity()]
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
        },
      }
    },
  }
}
