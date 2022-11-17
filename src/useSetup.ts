import { useMemo } from "react"
import { useResetError } from "./ErrorBoundary"
import { setupRoom } from "./mapToSetupRoom"
import { useFirestore } from "./useFirestore"
import { Room } from "./zod/roomZod"

export function useSetup(roomId: Room["id"] | undefined): (() => void) | null {
  const db = useFirestore()
  const resetError = useResetError()

  const setup = useMemo(() => {
    if (!roomId) {
      return null
    }

    let called = false

    return async () => {
      if (called) return
      called = true

      await setupRoom(db, roomId)

      resetError()
    }
  }, [db, resetError, roomId])

  return setup
}
