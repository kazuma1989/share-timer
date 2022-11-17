import { ReactNode, useState } from "react"
import { ErrorBoundary } from "./ErrorBoundary"
import { InvalidDoc } from "./mapToRoom"
import { useSetup } from "./useSetup"
import { suspend } from "./util/suspend"
import { Room } from "./zod/roomZod"

export function SetupRoom({ children }: { children?: ReactNode }) {
  const [invalidRoomId, setInvalidRoomId] = useState<Room["id"]>()

  return (
    <ErrorBoundary
      shouldCatch={(error) => {
        if (!Array.isArray(error)) return

        const [reason, payload] = error as InvalidDoc
        if (reason == "invalid-doc") {
          setInvalidRoomId(payload)
          return true
        }
      }}
      fallback={<SetupRoomFallback invalidRoomId={invalidRoomId} />}
    >
      {children}
    </ErrorBoundary>
  )
}

function SetupRoomFallback({ invalidRoomId }: { invalidRoomId?: Room["id"] }) {
  const setup = useSetup(invalidRoomId)
  if (setup) {
    suspend(setup)
  }

  return null
}
