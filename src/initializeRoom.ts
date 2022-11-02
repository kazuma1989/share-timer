import { doc, Firestore, writeBatch } from "firebase/firestore"
import {
  debounceTime,
  filter,
  map,
  merge,
  mergeMap,
  MonoTypeOperatorFunction,
  Observable,
  pipe,
  scan,
  share,
  startWith,
  windowToggle,
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

  invalidEvent$
    .pipe(
      pauseWhileLoop(invalidEvent$, () => {
        throw new Error("Detect room initialization loop. Something went wrong")
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

function pauseWhileLoop<T>(
  target$: Observable<unknown>,
  onLoopDetected?: () => void
): MonoTypeOperatorFunction<T> {
  const [looping$, settled$] = detectLoop(target$, 10, 2_000)

  if (onLoopDetected) {
    looping$.subscribe(onLoopDetected)
  }

  return pipe(
    windowToggle(settled$, () => looping$),
    mergeMap((_) => _)
  )
}

function detectLoop(
  target$: Observable<unknown>,
  criteria: number,
  debounce: number
): [looping$: Observable<number>, settled$: Observable<number>] {
  const hot$ = target$.pipe(share())

  const settled$ = hot$.pipe(
    debounceTime(debounce),
    startWith(null),
    map(() => 0)
  )

  const looping$ = merge(hot$.pipe(map(() => 1)), settled$).pipe(
    scan((acc, current) => {
      if (current === 0) {
        return 0
      }

      return acc + current
    }, 0),
    filter((count) => count >= criteria)
  )

  return [looping$, settled$]
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
      const base$ = hot("1234---5-----1234|")

      const [looping$, settled$] = detectLoop(base$, 3, 5)

      expectObservable(looping$).toEqual(
        hot("--34---5-------34|").pipe(map((_) => Number(_)))
      )

      expectObservable(settled$).toEqual(
        hot("0-----------0----(0|)").pipe(map((_) => Number(_)))
      )
    })
  })
}
