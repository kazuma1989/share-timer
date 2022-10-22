import { Plugin } from "vite"

export default function vendorChunks(): Plugin {
  return {
    name: "vendorChunks",

    config() {
      return {
        build: {
          rollupOptions: {
            output: {
              manualChunks(id) {
                switch (true) {
                  case id.includes("/node_modules/@firebase"):
                  case id.includes("/node_modules/firebase"):
                    return "firebase"

                  case id.includes("/node_modules/react"):
                    return "react"

                  case id.includes("/node_modules/zod"):
                    return "zod"
                }
              },
            },
          },
        },
      }
    },
  }
}
