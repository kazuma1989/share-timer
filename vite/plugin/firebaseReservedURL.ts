import * as fs from "node:fs/promises"
import * as path from "node:path"
import { Plugin } from "vite"

interface Firebaserc {
  projects: {
    default: string
  }
}

/**
 * 本物の Firebase Hosting サイトから `/__` で始まる予約済み URL の中身を取得するプロキシーを設定
 */
export default function firebaseReservedURL(): Plugin {
  const getFirebaserc = () =>
    fs
      .readFile(path.join(__dirname, "../../.firebaserc"), {
        encoding: "utf-8",
      })
      .then<Firebaserc>(JSON.parse)
      .catch(() => null)

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
