import { doc, Firestore, writeBatch } from "firebase/firestore"
import { filter, map, merge, Observable, scan, takeUntil } from "rxjs"
import { collection } from "./firestore/collection"
import { withMeta } from "./firestore/withMeta"
import { replaceHash } from "./observeHash"
import { InvalidDoc, InvalidId } from "./observeRoom"
import { sparse } from "./util/sparse"
import { ActionOnFirestore } from "./zod/actionZod"
import { Room, roomIdZod, RoomOnFirestore } from "./zod/roomZod"

export function initializeRoom(
  db: Firestore,
  room$: Observable<Room>,
  invalid$: Observable<InvalidDoc | InvalidId>
): void {
  const invalidEvent$ = invalid$.pipe(sparse(200))

  const loopDetected$ = merge(
    room$.pipe(map(() => "reset" as const)),
    invalidEvent$.pipe(map(() => 1))
  ).pipe(
    scan((acc, current) => {
      if (current === "reset") {
        return 0
      }

      return acc + current
    }, 0),
    filter((count) => count >= 10)
  )

  loopDetected$.subscribe(() => {
    throw new Error("Detect hash change loop. Something went wrong")
  })

  invalidEvent$.pipe(takeUntil(loopDetected$)).subscribe(async (reason) => {
    const [type] = reason
    switch (type) {
      case "invalid-id": {
        const newRoomId = roomIdZod.parse(doc(collection(db, "rooms")).id)
        replaceHash(newRoomId)
        break
      }

      case "invalid-doc": {
        const [, roomId] = reason
        await setupRoom(db, roomId)
        break
      }
    }
  })
}

async function setupRoom(db: Firestore, newRoomId: string): Promise<void> {
  const batch = writeBatch(db)

  const emoji = await import("./emoji/Animals & Nature.json").then(
    (_) => _.default
  )
  const e = emoji[(Math.random() * emoji.length) | 0]!

  const rooms = collection(db, "rooms")
  batch.set(
    doc(rooms, newRoomId),
    withMeta<RoomOnFirestore>({
      name: e.value + " " + e.name,
    })
  )

  const actions = collection(db, "rooms", newRoomId, "actions")
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
