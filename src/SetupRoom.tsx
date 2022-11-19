import { ReactNode, useEffect } from "react"
import { ErrorBoundary, useError, useResetError } from "./ErrorBoundary"
import { InvalidDoc } from "./mapToRoom"
import { useSetup } from "./useSetup"
import { suspend } from "./util/suspend"

export function SetupRoom({ children }: { children?: ReactNode }) {
  return (
    <ErrorBoundary fallback={<SetupRoomFallback />}>{children}</ErrorBoundary>
  )
}

function SetupRoomFallback() {
  const error = useError()
  if (!Array.isArray(error)) {
    throw error
  }

  const [reason, payload] = error as InvalidDoc
  if (reason !== "invalid-doc") {
    throw error
  }

  const invalidRoomId = payload
  const setup = useSetup(invalidRoomId)
  if (setup) {
    suspend(setup)
  }

  const resetError = useResetError()
  useEffect(() => {
    resetError()
  }, [resetError])

  return null
}
