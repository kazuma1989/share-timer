import { doc, Firestore, writeBatch } from "firebase/firestore"
import { distinctUntilChanged, Observable } from "rxjs"
import { collection } from "./firestore/collection"
import { withMeta } from "./firestore/withMeta"
import { InvalidDoc, InvalidId, NoDocExists } from "./mapToRoom"
import { replaceHash } from "./observeHash"
import { pauseWhileLoop } from "./util/pauseWhileLoop"
import { shallowEqual } from "./util/shallowEqual"
import { sparse } from "./util/sparse"
import { ActionOnFirestore } from "./zod/actionZod"
import { roomIdZod, RoomOnFirestore } from "./zod/roomZod"

export function initializeRoom(
  db: Firestore,
  invalid$: Observable<InvalidDoc | NoDocExists | InvalidId>
): void {
  invalid$
    .pipe(
      distinctUntilChanged(shallowEqual),
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
      const [type] = reason
      switch (type) {
        case "invalid-id": {
          const newRoomId = roomIdZod.parse(doc(collection(db, "rooms")).id)

          replaceHash(newRoomId)
          break
        }

        case "no-doc-exists": {
          const [, roomId] = reason

          await setupRoom(db, roomId, "create")
          break
        }

        case "invalid-doc": {
          const [, roomId] = reason

          await setupRoom(db, roomId, "update")
          break
        }
      }
    })
}

async function setupRoom(
  db: Firestore,
  roomId: string,
  type: "create" | "update"
): Promise<void> {
  const batch = writeBatch(db)

  const emoji = await import("./emoji/Animals & Nature.json").then(
    (_) => _.default
  )
  const e = emoji[(Math.random() * emoji.length) | 0]!

  const rooms = collection(db, "rooms")
  switch (type) {
    case "create": {
      batch.set(
        doc(rooms, roomId),
        withMeta<RoomOnFirestore>({
          name: e.value + " " + e.name,
        })
      )
      break
    }

    case "update": {
      batch.update<RoomOnFirestore>(doc(rooms, roomId), {
        name: e.value + " " + e.name,
      })
      break
    }
  }

  const actions = collection(db, "rooms", roomId, "actions")
  batch.set(
    doc(actions),
    withMeta<ActionOnFirestore>({
      type: "cancel",
      withDuration: DEFAULT_DURATION,
    })
  )

  await batch.commit()
}

const DEFAULT_DURATION = 3 * 60_000
