// https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript
interface ImportMetaEnv {
  FIREBASE_EMULATORS: typeof import("../firebase.json")["emulators"]
  FIREBASE_PROJECTS_DEFAULT: string

  VITE_AUTH_EMULATOR: string
  VITE_DB_VERSION: string
  VITE_FIRESTORE_EMULATOR: string
  VITE_STRIPE_PUBLISHABLE_KEY: string
}
