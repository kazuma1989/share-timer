import type { Plugin } from "vite"
import { getFirebaserc } from "../getFirebaserc"

/**
 * 本物の Firebase Hosting サイトから `/__` で始まる予約済み URL の中身を取得するプロキシーを設定
 */
export default function firebaseReservedURL(): Plugin {
  return {
    name: "firebaseReservedURL",

    async config() {
      const rc = await getFirebaserc()
      if (!rc) return

      return {
        server: {
          proxy: {
            "/__": {
              target: `https://${rc.projects.default}.web.app`,
              changeOrigin: true,
            },
          },
        },
      }
    },
  }
}
