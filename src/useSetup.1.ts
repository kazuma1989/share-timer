import { getContext } from "svelte"
import type { Room } from "./zod/roomZod"

export function useSetup(
  roomId: Room["id"]
): (() => void | PromiseLike<void>) | null {
  return (getContext<typeof useSetup | undefined>(key) ?? fallback)(roomId)
}

export function keyWithUseSetup(
  useSetupImpl: typeof useSetup
): [typeof key, typeof useSetup] {
  return [key, useSetupImpl]
}

const key = Symbol()

const fallback = () => null
