import { createContext } from "./createContext"
import type { Room } from "./schema/roomSchema"

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

export const [keyWithUseLockRoom, useImpl] = createContext<typeof useLockRoom>(
  "UseLockRoomProvider",
  () => async () => {}
)
