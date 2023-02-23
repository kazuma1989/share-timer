import { defineString } from "firebase-functions/params"

const DB_VERSION$ = defineString("DB_VERSION")

export function collection(
  ...paths: ["checkout-sessions"] | ["custom-claims"]
): string {
  return withVersionSuffix(
    paths,
    paths[0] === "custom-claims" ? "v1" : DB_VERSION$.value()
  ).join("/")
}

export function document(...paths: ["custom-claims", "{id}"]): string {
  return withVersionSuffix(paths, "v1").join("/")
}

function withVersionSuffix(
  paths: [string, ...string[]],
  suffix: string
): [string, ...string[]] {
  const [root, ...rest] = paths

  return [root + "-" + suffix, ...rest]
}
