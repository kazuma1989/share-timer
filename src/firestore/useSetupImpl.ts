import { doc, Firestore, runTransaction } from "firebase/firestore"
import { createCache } from "../util/createCache"
import { ActionInput } from "../zod/actionZod"
import { Room, RoomOnFirestore } from "../zod/roomZod"
import { collection } from "./collection"
import { useFirestore } from "./useFirestore"
import { withMeta } from "./withMeta"

export function useSetupImpl(roomId: Room["id"]): (() => void) | null {
  const db = useFirestore()

  const setup = hardCache(roomId, () => async () => {
    import.meta.env.DEV && console.debug("setup called")

    await setupRoom(db, roomId)
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
async function setupRoom(db: Firestore, roomId: string): Promise<void> {
  abort.abort()
  abort = new AbortController()

  await _setupRoom(db, roomId, abort.signal).catch((_: unknown) => {
    console.debug("aborted setup room", _)
  })
}

let abort = new AbortController()

async function _setupRoom(
  db: Firestore,
  roomId: string,
  signal: AbortSignal
): Promise<void> {
  const emoji = await import("../emoji/Animals & Nature.json").then(
    (_) => _.default
  )
  if (signal.aborted) throw "aborted 1"

  const e = emoji[(Math.random() * emoji.length) | 0]!
  const roomName = `${e.value} ${e.name}`

  await runTransaction(
    db,
    async (transaction) => {
      const roomDoc = await transaction.get(
        doc(collection(db, "rooms"), roomId)
      )
      if (signal.aborted) throw "aborted 2"

      if (roomDoc.exists()) {
        transaction.update<RoomOnFirestore>(roomDoc.ref, {
          name: roomName,
        })
      } else {
        transaction.set(
          roomDoc.ref,
          withMeta({
            name: roomName,
          } satisfies RoomOnFirestore)
        )
      }

      transaction.set(
        doc(collection(db, "rooms", roomId, "actions")),
        withMeta({
          type: "cancel",
          withDuration: DEFAULT_DURATION,
        } satisfies ActionInput)
      )
    },
    {
      maxAttempts: 1,
    }
  )
}

const DEFAULT_DURATION = 3 * 60000
