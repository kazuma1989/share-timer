import { Plugin } from "vite"

/**
 * Vite server の host が localhost 以外でも Firestore emulator に接続できるようなプロキシーを設定
 */
export function firestoreEmulatorProxy(): Plugin {
  return {
    name: "firestoreEmulatorProxy",

    async config() {
      const { emulators } = await import("../../firebase.json")

      return {
        server: {
          proxy: {
            "^/google\\..+": {
              target: `http://127.0.0.1:${emulators.firestore.port}`,
              changeOrigin: true,
            },
          },
        },
      }
    },
  }
}
