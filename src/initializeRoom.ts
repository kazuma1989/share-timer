import { doc, Firestore, writeBatch } from "firebase/firestore"
import {
  debounceTime,
  filter,
  map,
  merge,
  Observable,
  scan,
  takeUntil,
} from "rxjs"
import { collection } from "./firestore/collection"
import { withMeta } from "./firestore/withMeta"
import { InvalidDoc, InvalidId, NoDocExists } from "./mapToRoom"
import { replaceHash } from "./observeHash"
import { sparse } from "./util/sparse"
import { ActionOnFirestore } from "./zod/actionZod"
import { roomIdZod, RoomOnFirestore } from "./zod/roomZod"

export function initializeRoom(
  db: Firestore,
  invalid$: Observable<InvalidDoc | NoDocExists | InvalidId>
): void {
  const invalidEvent$ = invalid$.pipe(sparse(200))

  const loopDetected$ = detectLoop(invalidEvent$, 10, 2_000)

  loopDetected$.subscribe(() => {
    throw new Error("Detect room initialization loop. Something went wrong")
  })

  invalidEvent$.pipe(takeUntil(loopDetected$)).subscribe(async (reason) => {
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

function detectLoop(
  target$: Observable<unknown>,
  criteria: number,
  debounce: number
): Observable<number> {
  return merge(
    target$.pipe(map(() => 1)),
    target$.pipe(
      debounceTime(debounce),
      map(() => "reset" as const)
    )
  ).pipe(
    scan((acc, current) => {
      if (current === "reset") {
        return 0
      }

      return acc + current
    }, 0),
    filter((count) => count >= criteria)
  )
}

if (import.meta.vitest) {
  const { test, expect, beforeEach } = import.meta.vitest
  const { TestScheduler } = await import("rxjs/testing")

  let scheduler: InstanceType<typeof TestScheduler>
  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toStrictEqual(expected)
    })
  })

  test("detectLoop", () => {
    scheduler.run(({ expectObservable, hot }) => {
      const base$ = hot("1234---5-----6789|")

      const actual$ = detectLoop(base$, 3, 5)

      expectObservable(actual$).toEqual(
        hot("--34---5-------34|").pipe(map((_) => Number(_)))
      )
    })
  })
}
