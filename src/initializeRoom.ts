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
import { InvalidDoc, InvalidId } from "./mapToRoom"
import { replaceHash } from "./observeHash"
import { sparse } from "./util/sparse"
import { ActionOnFirestore } from "./zod/actionZod"
import { roomIdZod, RoomOnFirestore } from "./zod/roomZod"

export function initializeRoom(
  db: Firestore,
  invalid$: Observable<InvalidDoc | InvalidId>
): void {
  const invalidEvent$ = invalid$.pipe(sparse(200))

  const loopDetected$ = detectLoop(invalidEvent$, 2_000, 10)

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

function detectLoop(
  target$: Observable<unknown>,
  debounce: number,
  criteria: number
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
    scheduler.run(({ expectObservable, hot, time }) => {
      const base$ = hot("12345---6789|")

      const actual$ = detectLoop(base$, time("---|"), 3)

      expectObservable(actual$).toEqual(
        hot("--345-----34|").pipe(map((_) => Number(_)))
      )
    })
  })
}
