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

      const linkTagRE =
        /<link\b[^>]+rel\s*=\s*(?:"stylesheet"|'stylesheet')[^>]*>/gis

      return html.replace(linkTagRE, (linkTag) => {
        const hrefRE = /\bhref\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/i

        const [, doubleQuoted, singleQuoted, noQuoted] =
          linkTag.match(hrefRE) ?? []
        const href = doubleQuoted ?? singleQuoted ?? noQuoted

        if (href === `/${cssAsset.fileName}`) {
          return `<style>\n${cssAsset.source}\n</style>`
        } else {
          return linkTag
        }
      })
    },
  }
}

type Narrow<T, U> = T extends U ? T : never
