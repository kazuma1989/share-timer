import { Firestore } from "firebase/firestore"
import { map, OperatorFunction } from "rxjs"
import { InvalidDoc } from "./mapToRoom"
import { setupRoom } from "./setupRoom"

export function mapToSetupRoom(
  db: Firestore
): OperatorFunction<InvalidDoc, () => Promise<void>> {
  return map(([, roomId]) => {
    let called = false

    return async () => {
      if (called) return
      called = true

      await setupRoom(db, roomId).catch((_: unknown) => {
        console.debug("aborted setup room", _)
      })
    }
  })
}
