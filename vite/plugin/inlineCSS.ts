import { Plugin } from "vite"

export default function inlineCSS(): Plugin {
  return {
    name: "inlineCSS",

    config() {
      return {
        build: {
          // CSS が細かくなりすぎるのでまとめる
          cssCodeSplit: false,
        },
      }
    },

    transformIndexHtml(html, { bundle }): string | void {
      const cssAsset = Object.values(bundle ?? {}).find(
        (_): _ is Narrow<typeof _, { type: "asset" }> =>
          _.type === "asset" && _.name === "style.css"
      )
      if (!cssAsset) return

      const { fileName, source } = cssAsset

      return html.replace(
        `<link rel="stylesheet" href="/${fileName}">`,
        `<style>\n${source}\n</style>`
      )
    },
  }
}

type Narrow<T, U> = T extends U ? T : never
