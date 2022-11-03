import { doc, Firestore, runTransaction } from "firebase/firestore"
import { Observable } from "rxjs"
import { collection } from "./firestore/collection"
import { withMeta } from "./firestore/withMeta"
import { InvalidDoc, InvalidId } from "./mapToRoom"
import { replaceHash } from "./observeHash"
import { pauseWhileLoop } from "./util/pauseWhileLoop"
import { sparse } from "./util/sparse"
import { ActionOnFirestore } from "./zod/actionZod"
import { newRoomId, RoomOnFirestore } from "./zod/roomZod"

export function initializeRoom(
  db: Firestore,
  invalid$: Observable<InvalidDoc | InvalidId>
): void {
  let abort = new AbortController()

  invalid$
    .pipe(
      sparse(200),
      pauseWhileLoop({
        criteria: import.meta.env.PROD ? 20 : 5,
        debounce: 2_000,
        onLoopDetected() {
          throw new Error(
            "Detect room initialization loop. Something went wrong"
          )
        },
      })
    )
    .subscribe(async (reason) => {
      abort.abort()
      abort = new AbortController()

      const [type] = reason
      switch (type) {
        case "invalid-id": {
          replaceHash(newRoomId())
          break
        }

        case "invalid-doc": {
          const [, roomId] = reason

          await setupRoom(db, roomId, abort.signal).catch((_: unknown) => {
            console.debug("aborted setup room", _)
          })
          break
        }
      }
    })
}

async function setupRoom(
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

const DEFAULT_DURATION = 3 * 60_000
