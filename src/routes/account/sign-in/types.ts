export type Firebase = typeof import("firebase/compat").default

export type FirebaseUI = {
  auth: {
    AuthUI: {
      new (auth: import("firebase/compat").default.auth.Auth): any
      getInstance(): any
    }
  }
}
