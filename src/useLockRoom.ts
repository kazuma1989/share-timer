import { createContext } from "./createContext"
import { Room } from "./zod/roomZod"

export type AbortReason =
  | "signal"
  | "room-not-exists"
  | "already-locked"
  | "user-deny"

export const AbortReason = (_: AbortReason) => _

export function useLockRoom(): (
  roomId: Room["id"],
  lockedBy: string,
  options?: {
    signal?: AbortSignal
    onBeforeUpdate?(): void | PromiseLike<void>
  }
) => Promise<void> {
  return useImpl()()
}

export { ImplProvider as UseLockRoomProvider }

const [ImplProvider, useImpl] = createContext<typeof useLockRoom>(
  "UseLockRoomProvider",
  () => async () => {}
)
