// https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript
interface ImportMetaEnv {
  FIREBASE_EMULATORS: typeof import("../firebase.json")["emulators"]

  VITE_AUTH_EMULATOR: string
  VITE_DB_VERSION: string
  VITE_FIRESTORE_EMULATOR: string
  VITE_STRIPE_PRICING_TABLE_ID: string
  VITE_STRIPE_PUBLISHABLE_KEY: string
}
