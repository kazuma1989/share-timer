import { FieldValue, serverTimestamp } from "firebase/firestore"
import { ServerTimestamp } from "../util/ServerTimestamp"

interface Meta {
  createdAt: FieldValue
}

export function withMeta(docData: object): Meta {
  // FIXME 型がいまいちなのと、withMeta なのに timestamp の変換までやってるのが微妙
  const data = Object.fromEntries(
    Object.entries(docData).map((_) => {
      const [key, value] = _
      return value instanceof ServerTimestamp ? [key, serverTimestamp()] : _
    })
  )

  return {
    ...data,
    createdAt: serverTimestamp(),
  }
}
