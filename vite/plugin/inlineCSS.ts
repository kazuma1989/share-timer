import { Plugin } from "vite"

export default function inlineCSS(): Plugin {
  return {
    name: "inlineCSS",

    transformIndexHtml(html, { bundle }): string {
      const cssFiles = Object.values(bundle ?? {}).flatMap(
        (_): { fileName: string; source: string }[] =>
          _.type === "asset" &&
          _.fileName.endsWith(".css") &&
          typeof _.source === "string"
            ? [
                {
                  fileName: _.fileName,
                  source: _.source,
                },
              ]
            : []
      )

      cssFiles.forEach(({ fileName, source }) => {
        html = html.replace(
          `<link rel="stylesheet" href="/${fileName}">`,
          `<style>\n${source}\n</style>`
        )
      })

      return html
    },
  }
}
