import { createCache } from "$lib/util/createCache"
import { proxy, type Remote } from "comlink"
import type { Room } from "../schema/roomSchema"
import { useFirestore } from "./useFirestore"
import type { RemoteFirestore } from "./worker/RemoteFirestore.worker"

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
  roomId: Room["id"]
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
