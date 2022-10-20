/* eslint-disable no-restricted-imports */
import { QueryConstraint, where as _where } from "firebase/firestore"

export function where(
  fieldPath: "type",
  opStr: "==",
  value: "start"
): QueryConstraint {
  return _where(fieldPath, opStr, value)
}
