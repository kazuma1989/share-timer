// https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript
interface ImportMetaEnv {
  FIREBASE_EMULATORS: typeof import("../firebase.json")["emulators"]

  VITE_DB_VERSION: string
  VITE_FIRESTORE_EMULATOR: string
}
