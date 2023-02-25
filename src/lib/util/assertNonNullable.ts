import { nonNullable } from "./nonNullable"

export function assertNonNullable<T>(
  value: T
): asserts value is NonNullable<T> {
  if (!nonNullable(value)) {
    throw new Error("nullable value")
  }
}
