import { createContext } from "./createContext"
import type { Room } from "./zod/roomZod"

export function useSetup(roomId: Room["id"]): (() => void) | null {
  return useImpl()(roomId)
}

export { ImplProvider as UseSetupProvider }

const [ImplProvider, useImpl] = createContext<typeof useSetup>(
  "UseSetupProvider",
  () => null
)
