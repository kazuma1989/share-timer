import { orderBy as _orderBy, QueryConstraint } from "firebase/firestore"

export function orderBy(
  fieldPath: "createdAt",
  directionStr: "asc"
): QueryConstraint {
  return _orderBy(fieldPath, directionStr)
}
