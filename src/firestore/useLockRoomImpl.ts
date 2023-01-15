import { proxy } from "comlink"
import type { Room } from "../schema/roomSchema"
import { useFirestore } from "./useFirestore"

export function useLockRoomImpl(): (
  roomId: Room["id"],
  lockedBy: string,
  options?: {
    signal?: AbortSignal
    onBeforeUpdate?(): void | PromiseLike<void>
  }
) => Promise<void> {
  const firestore = useFirestore()

  return async (
    roomId: Room["id"],
    lockedBy: string,
    options?: {
      signal?: AbortSignal
      onBeforeUpdate?(): void | PromiseLike<void>
    }
  ) => {
    const { signal, onBeforeUpdate } = options ?? {}

    await firestore.lockRoom(
      roomId,
      lockedBy,
      proxy({
        aborted: () => signal?.aborted ?? false,
        onBeforeUpdate,
      })
    )
  }
}
