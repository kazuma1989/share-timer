import { doc, Firestore, runTransaction } from "firebase/firestore"
import { Observable } from "rxjs"
import { collection } from "./firestore/collection"
import { withMeta } from "./firestore/withMeta"
import { InvalidDoc, InvalidId } from "./mapToRoom"
import { replaceHash } from "./observeHash"
import { nanoid } from "./util/nanoid"
import { pauseWhileLoop } from "./util/pauseWhileLoop"
import { sparse } from "./util/sparse"
import { ActionOnFirestore } from "./zod/actionZod"
import { roomIdZod, RoomOnFirestore } from "./zod/roomZod"

export function initializeRoom(
  db: Firestore,
  invalid$: Observable<InvalidDoc | InvalidId>
): void {
  let abort = new AbortController()

  invalid$
    .pipe(
      sparse(200),
      pauseWhileLoop({
        criteria: 10,
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
          const raw = [nanoid(3), nanoid(4), nanoid(3)].join("-")
          const newRoomId = import.meta.env.DEV ? roomIdZod.parse(raw) : raw

          replaceHash(newRoomId)
          break
        }

        case "invalid-doc": {
          const [, roomId] = reason

          await setupRoom(db, roomId, abort.signal)
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
  const e = emoji[(Math.random() * emoji.length) | 0]!

  if (signal.aborted) throw "aborted 1"

  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(doc(collection(db, "rooms"), roomId))

    if (signal.aborted) throw "aborted 2"

    if (roomDoc.exists()) {
      transaction.update<RoomOnFirestore>(roomDoc.ref, {
        name: e.value + " " + e.name,
      })
    } else {
      transaction.set(
        roomDoc.ref,
        withMeta<RoomOnFirestore>({
          name: e.value + " " + e.name,
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
  })
}

const DEFAULT_DURATION = 3 * 60_000
