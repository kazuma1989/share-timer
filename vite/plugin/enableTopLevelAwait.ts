import { Plugin } from "vite"

/**
 * Top-level await が可能なビルドターゲットを指定する
 */
export default function enableTopLevelAwait(): Plugin {
  return {
    name: "enableTopLevelAwait",

    config() {
      return {
        build: {
          // Support top-level await
          // https://caniuse.com/mdn-javascript_operators_await_top_level
          target: ["chrome89", "edge89", "safari15", "firefox89", "opera75"],
        },
      }
    },
  }
}
