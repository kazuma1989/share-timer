import { roomSchema, type InvalidDoc, type Room } from "$lib/schema/roomSchema"
import type { DocumentSnapshot } from "firebase/firestore"
import { map, type OperatorFunction } from "rxjs"
import * as s from "superstruct"

export function mapToRoom(
  roomId: Room["id"]
): OperatorFunction<DocumentSnapshot, Room | InvalidDoc> {
  return map((snapshot): Room | InvalidDoc => {
    const rawData = snapshot.data({
      serverTimestamps: "estimate",
    })

    const [error, data] = s.validate(rawData, roomSchema)
    if (error) {
      if (rawData) {
        console.warn(rawData, error)
      }

      return ["invalid-doc", roomId]
    } else {
      return {
        ...data,
        id: roomId,
      }
    }
  })
}
