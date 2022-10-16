/* eslint-disable no-restricted-imports */
import {
  collection as _collection,
  CollectionReference,
  Firestore,
} from "firebase/firestore"

export function collection(
  db: Firestore,
  ...paths: ["rooms"] | ["rooms", string, "actions"] | ["calibrations"]
): CollectionReference {
  return _collection(db, ...withVersionSuffix(paths))
}

function withVersionSuffix(
  paths: [string, ...string[]]
): [string, ...string[]] {
  const [root, ...rest] = paths
  return [root + "-" + import.meta.env.VITE_DB_VERSION, ...rest]
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("basic", () => {
    expect(withVersionSuffix(["rooms"])).toStrictEqual(["rooms-dev"])
  })

  test("multiple paths", () => {
    expect(withVersionSuffix(["rooms", "xxx", "actions"])).toStrictEqual([
      "rooms-dev",
      "xxx",
      "actions",
    ])
  })
}
