import { doc, Firestore, runTransaction } from "firebase/firestore"
import { map, OperatorFunction, pipe } from "rxjs"
import { collection } from "./firestore/collection"
import { withMeta } from "./firestore/withMeta"
import { pauseWhileLoop } from "./util/pauseWhileLoop"
import { sparse } from "./util/sparse"
import { ActionOnFirestore } from "./zod/actionZod"
import { Room, RoomOnFirestore } from "./zod/roomZod"

export function mapToSetupRoom(
  db: Firestore
): OperatorFunction<Room["id"], () => Promise<void>> {
  return pipe(
    sparse(200),
    pauseWhileLoop({
      criteria: import.meta.env.PROD ? 20 : 5,
      debounce: 2_000,
      onLoopDetected() {
        throw new Error("Detect room initialization loop. Something went wrong")
      },
    }),
    map((roomId) => {
      let called = false

      return async () => {
        if (called) return
        called = true

        await setupRoom(db, roomId)
      }
    })
  )
}

/**
 * 同時に1つしか呼べない
 *
 * roomIdが同じであっても異なっても。
 * 1つのJSプロセスで複数roomIdセットアップする使い方を想定しないため。
 */
export async function setupRoom(db: Firestore, roomId: string): Promise<void> {
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
  const emoji = await import("./emoji/Animals & Nature.json").then(
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
          withMeta<RoomOnFirestore>({
            name: roomName,
          })
        )
      }

      transaction.set(
        doc(collection(db, "rooms", roomId, "actions")),
        withMeta<ActionOnFirestore>({
          type: "cancel",
          withDuration: DEFAULT_DURATION,
        })
      )
    },
    {
      maxAttempts: 1,
    }
  )
}

const DEFAULT_DURATION = 3 * 60000
