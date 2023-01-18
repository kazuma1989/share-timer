import { Plugin } from "vite"

/**
 * チャンク粒度をある程度のファイルサイズに揃える
 */
export default function chunkAlignGranularity(): Plugin {
  return {
    name: "chunkAlignGranularity",

    config() {
      return {
        build: {
          // モジュールサイズが小さすぎると TTFB が律速するので、ある程度のかたまりを維持できるようにアセットをまとめる
          assetsInlineLimit: 4096 * 2,

          // CSS が細かくなりすぎないようまとめる
          // Tailwind を使っているとどっちにしろチャンク分割が起きない可能性があるが、明示的に設定しておく
          cssCodeSplit: false,
        },
      }
    },
  }
}
