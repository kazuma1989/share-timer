/* eslint-disable no-restricted-imports */
import { where as _where, type QueryConstraint } from "firebase/firestore"

export function where(
  fieldPath: "type",
  opStr: "==",
  value: "start"
): QueryConstraint

export function where(
  fieldPath: "client_reference_id",
  opStr: "==",
  value: string
): QueryConstraint

export function where(
  fieldPath: string,
  opStr: "==",
  value: string
): QueryConstraint {
  return _where(fieldPath, opStr, value)
}
