import {
  serverTimestamp as firestoreServerTimestamp,
  type FieldValue,
} from "firebase/firestore"
import { serverTimestamp } from "../../serverTimestamp"

export function convertServerTimestamp<T extends Record<string, unknown>>(
  value: T
): {
  [P in keyof T]: T[P] extends typeof serverTimestamp ? FieldValue : T[P]
} {
  return Object.fromEntries(
    Object.entries(value).map(([key, value]) => [
      key,
      value === serverTimestamp ? firestoreServerTimestamp() : value,
    ])
  ) as any
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("convertServerTimestamp", async () => {
    const { FieldValue } = await import("firebase/firestore")

    const x = convertServerTimestamp({
      a: "A",
      b: serverTimestamp,
    })

    expect(x).toMatchObject({
      a: "A",
      b: expect.any(FieldValue),
    } satisfies typeof x)
  })
}
