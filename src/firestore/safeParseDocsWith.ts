import type { DocumentSnapshot } from "firebase/firestore"

export function safeParseDocsWith<T>(
  parse: (raw: unknown) => T
): (docs: DocumentSnapshot[]) => T[] {
  return (docs) =>
    docs.flatMap((doc): T[] => {
      const rawData = doc.data({
        serverTimestamps: "estimate",
      })

      try {
        return [parse(rawData)]
      } catch (reason) {
        console.debug(rawData, reason)

        return []
      }
    })
}
