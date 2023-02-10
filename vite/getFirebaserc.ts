import * as fs from "node:fs/promises"
import * as path from "node:path"

interface Firebaserc {
  projects: {
    default: string
  }
}

export async function getFirebaserc(): Promise<Firebaserc | null> {
  return fs
    .readFile(path.join(__dirname, "../.firebaserc"), {
      encoding: "utf-8",
    })
    .then<Firebaserc>(JSON.parse)
    .catch(() => null)
}
