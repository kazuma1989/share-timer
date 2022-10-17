import { DocumentSnapshot } from "firebase/firestore"
import * as z from "zod"

export function safeParseDocsWith<T>(
  zod: z.ZodType<T, any, unknown>
): (docs: DocumentSnapshot[]) => T[] {
  return (docs) =>
    docs.flatMap<T>((doc) => {
      const rawData = doc.data({
        serverTimestamps: "estimate",
      })

      const _ = zod.safeParse(rawData)
      if (_.success) {
        return [_.data]
      }

      console.debug(rawData, _.error)
      return []
    })
}
