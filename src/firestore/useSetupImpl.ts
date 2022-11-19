import { setupRoom } from "../mapToSetupRoom"
import { useFirestore } from "../useFirestore"
import { createCache } from "../util/createCache"
import { Room } from "../zod/roomZod"

export function useSetupImpl(roomId: Room["id"]): (() => void) | null {
  const db = useFirestore()

  const setup = hardCache(roomId, () => async () => {
    import.meta.env.DEV && console.debug("setup called")

    await setupRoom(db, roomId)
  })

  return setup
}

const hardCache = createCache(true)
