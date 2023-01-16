import { HtmlTagDescriptor, Plugin } from "vite"

export default function prefetchWorker(): Plugin {
  return {
    name: "prefetchWorker",
    apply: "build",

    transformIndexHtml(_, { bundle }): HtmlTagDescriptor[] {
      const workerFileNames = Object.values(bundle ?? {}).flatMap(
        ({ type, fileName }): string[] =>
          type === "asset" &&
          fileName.endsWith(".js") &&
          fileName.includes(".worker-")
            ? [fileName]
            : []
      )

      return workerFileNames.map((fileName) => ({
        injectTo: "head",
        tag: "link",
        attrs: {
          rel: "prefetch",
          href: "/" + fileName,
        },
      }))
    },
  }
}
