/* eslint-disable no-restricted-imports */
import { orderBy as _orderBy, type QueryConstraint } from "firebase/firestore"

export function orderBy(
  fieldPath: "createdAt",
  directionStr: "asc"
): QueryConstraint {
  return _orderBy(fieldPath, directionStr)
}
