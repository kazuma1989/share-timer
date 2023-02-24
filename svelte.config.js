import adapterStatic from "@sveltejs/adapter-static"
import { vitePreprocess } from "@sveltejs/kit/vite"
import firebase from "./firebase.json" assert { type: "json" }

/** @type {import('@sveltejs/kit').Config} */
export default {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapterStatic({
      outDir: firebase.hosting.find((_) => _.target === "app")?.public,
    }),
  },
}
