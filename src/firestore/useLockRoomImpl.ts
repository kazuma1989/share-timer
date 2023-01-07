import { doc, runTransaction } from "firebase/firestore"
import { AbortReason } from "../useLockRoom"
import { roomZod, type Room, type RoomInput } from "../zod/roomZod"
import { collection } from "./collection"
import { useFirestore } from "./useFirestore"

export function useLockRoomImpl(): (
  roomId: Room["id"],
  lockedBy: string,
  options?: {
    signal?: AbortSignal
    onBeforeUpdate?(): void | PromiseLike<void>
  }
) => Promise<void> {
  const db = useFirestore()

  return async (
    roomId: Room["id"],
    lockedBy: string,
    options?: {
      signal?: AbortSignal
      onBeforeUpdate?(): void | PromiseLike<void>
    }
  ) => {
    const { signal, onBeforeUpdate } = options ?? {}

    await runTransaction(
      db,
      async (transaction) => {
        const roomDoc = await transaction.get(
          doc(collection(db, "rooms"), roomId)
        )
        if (signal?.aborted) {
          throw AbortReason("signal")
        }

        if (!roomDoc.exists()) {
          throw AbortReason("room-not-exists")
        }

        const room = roomZod.parse(roomDoc.data())
        if (room.lockedBy) {
          throw AbortReason("already-locked")
        }

        await onBeforeUpdate?.()
        if (signal?.aborted) {
          throw AbortReason("signal")
        }

        transaction.update(roomDoc.ref, {
          lockedBy,
        } satisfies RoomInput)
      },
      {
        maxAttempts: 1,
      }
    )
  }
}
