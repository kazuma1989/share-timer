import { useResetError } from "./ErrorBoundary"
import { setupRoom } from "./mapToSetupRoom"
import { useFirestore } from "./useFirestore"
import { createCache } from "./util/createCache"
import { Room } from "./zod/roomZod"

export function useSetup(roomId: Room["id"]): (() => void) | null {
  const db = useFirestore()
  const resetError = useResetError()

  const setup = hardCache(roomId, () => {
    let called = false

    return async () => {
      import.meta.env.DEV && console.count("setup")

      if (called) return
      called = true

      await setupRoom(db, roomId)

      resetError()
    }
  })

  return setup
}

const hardCache = createCache(true)
