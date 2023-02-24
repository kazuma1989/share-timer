import adapterStatic from "@sveltejs/adapter-static"
import { vitePreprocess } from "@sveltejs/kit/vite"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

/** @type {import("./firebase.json")} */
const { hosting } = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./firebase.json", import.meta.url)),
    "utf-8"
  )
)

/** @type {import("@sveltejs/kit").Config} */
export default {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapterStatic({
      outDir: hosting.find((_) => _.target === "app")?.public,
    }),
  },
}
