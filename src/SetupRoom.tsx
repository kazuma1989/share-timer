// @ts-expect-error
import { ReactNode, useEffect } from "react"
import { ErrorBoundary, useError, useResetError } from "./ErrorBoundary"
import type { InvalidDoc } from "./schema/roomSchema"
import { useSetup } from "./useSetup"
import { suspend } from "./util/suspend"

export function SetupRoom({ children }: { children?: ReactNode }) {
  return (
    <ErrorBoundary fallback={<SetupRoomFallback />}>{children}</ErrorBoundary>
  )
}

function SetupRoomFallback() {
  const error = useError()
  assertInvalidDoc(error)

  const [, invalidRoomId] = error

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

function assertInvalidDoc(error: unknown): asserts error is InvalidDoc {
  if (!Array.isArray(error)) {
    throw error
  }

  const [reason] = error as InvalidDoc
  if (reason !== "invalid-doc") {
    throw error
  }
}
