import { HtmlTagDescriptor, Plugin } from "vite"

export default function prefetchWorker(): Plugin {
  return {
    name: "prefetchWorker",

    transformIndexHtml(_, { bundle }): HtmlTagDescriptor[] {
      const workerFileNames = Object.values(bundle ?? {}).flatMap(
        (assetOrChunk): string[] => {
          if (assetOrChunk.type !== "asset") {
            return []
          }

          const { fileName } = assetOrChunk
          if (fileName.endsWith(".js") && fileName.includes(".worker-")) {
            return [fileName]
          }

          return []
        }
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
