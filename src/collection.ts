/* eslint-disable no-restricted-imports */
import {
  collection as _collection,
  CollectionReference,
  Firestore,
} from "firebase/firestore"

export function collection(
  db: Firestore,
  ...paths: ["rooms"] | ["rooms", string, "actions"]
): CollectionReference {
  return _collection(db, ...withModeSuffix(paths))
}

function withModeSuffix(paths: [string, ...string[]]): [string, ...string[]] {
  return [`${paths[0]}-${import.meta.env.MODE}`, ...paths.splice(1)]
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("basic", () => {
    expect(withModeSuffix(["rooms"])).toStrictEqual(["rooms-test"])
  })

  test("multiple paths", () => {
    expect(withModeSuffix(["rooms", "xxx", "actions"])).toStrictEqual([
      "rooms-test",
      "xxx",
      "actions",
    ])
  })
}
