import { useHash } from "./useHash"

export function useRoomId(): string {
  const roomId = useHash().slice("#".length)

  if (!roomId) {
    throw new Promise((resolve) => {
      window.addEventListener("hashchange", resolve, {
        passive: true,
        once: true,
      })
    })
  }

  return roomId
}
