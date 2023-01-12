import { proxy, type Remote } from "comlink"
import { createCache } from "../util/createCache"
import type { Room } from "../zod/roomZod"
import { useFirestore } from "./useFirestore"
import type { RemoteFirestore } from "./worker"

export function useSetupImpl(roomId: Room["id"]): (() => void) | null {
  const firestore = useFirestore()

  const setup = hardCache(roomId, () => async () => {
    import.meta.env.DEV && console.debug("setup called", roomId)

    await setupRoom(firestore, roomId)
  })

  return setup
}

const hardCache = createCache(true)

/**
 * 同時に1つしか呼べない
 *
 * roomIdが同じであっても異なっても。
 * 1つのJSプロセスで複数roomIdセットアップする使い方を想定しないため。
 */
async function setupRoom(
  firestore: Remote<RemoteFirestore>,
  roomId: string
): Promise<void> {
  abort.abort()
  abort = new AbortController()

  await firestore
    .setupRoom(
      roomId,
      proxy(() => abort.signal.aborted)
    )
    .catch((_: unknown) => {
      console.debug("aborted setup room", _)
    })
}

let abort = new AbortController()
