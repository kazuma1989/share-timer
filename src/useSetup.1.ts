import { createContext } from "./createContext.1"
import type { Room } from "./zod/roomZod"

export function useSetup(
  roomId: Room["id"]
): (() => void | PromiseLike<void>) | null {
  return _useImpl()(roomId)
}

export const [keyWithUseSetup, _useImpl] = createContext<typeof useSetup>(
  "useSetup",
  () => null
)
