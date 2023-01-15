/* eslint-disable no-restricted-imports */
import { where as _where, type QueryConstraint } from "firebase/firestore"

export function where(
  fieldPath: "type",
  opStr: "==",
  value: "start"
): QueryConstraint {
  return _where(fieldPath, opStr, value)
}
