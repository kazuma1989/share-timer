import { defineString } from "firebase-functions/params"

const DB_VERSION$ = defineString("DB_VERSION")

export function collection(
  ...paths: ["checkout-sessions"] | ["custom-claims"]
): string {
  return withVersionSuffix(paths).join("/")
}

export function document(
  ...paths: ["checkout-sessions", "{id}"] | ["custom-claims", "{id}"]
): string {
  return withVersionSuffix(paths).join("/")
}

function withVersionSuffix(
  paths: [string, ...string[]]
): [string, ...string[]] {
  const [root, ...rest] = paths
  return [root + "-" + DB_VERSION$.value(), ...rest]
}
