/* eslint-disable no-restricted-imports */
import { QueryConstraint, where as _where } from "firebase/firestore"

export function where(
  fieldPath: "type",
  opStr: "==",
  value: "cancel"
): QueryConstraint {
  return _where(fieldPath, opStr, value)
}
