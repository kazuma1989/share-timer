import { doc, Firestore } from "firebase/firestore"
import {
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  merge,
  Observable,
  of,
  partition,
  scan,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
} from "rxjs"
import { collection } from "./firestore/collection"
import { setupRoom } from "./setupRoom"
import { snapshotOf } from "./util/snapshotOf"
import { sparse } from "./util/sparse"
import { Room, roomIdZod, roomZod } from "./zod/roomZod"

export function initializeRoom(db: Firestore): Observable<Room> {
  const hash$ = fromEvent(window, "hashchange" as keyof WindowEventMap, {
    passive: true,
  }).pipe(
    startWith(null),
    map(() => window.location.hash),
    distinctUntilChanged()
  )

  const _ = partition(
    hash$.pipe(
      map((hash) => roomIdZod.safeParse(hash.slice("#".length))),
      switchMap((_) => {
        if (!_.success) {
          return of<["invalid-id"]>(["invalid-id"])
        }

        const roomId = _.data

        return snapshotOf(doc(collection(db, "rooms"), roomId)).pipe(
          map((doc): Room | ["invalid-doc", Room["id"]] => {
            const _ = roomZod.safeParse(doc.data())
            if (!_.success) {
              return ["invalid-doc", roomId]
            }

            return {
              ..._.data,
              id: roomId,
            }
          })
        )
      }),
      shareReplay()
    ),
    (_): _ is Room =>
      !Array.isArray(_) || (_[0] !== "invalid-id" && _[0] !== "invalid-doc")
  )

  const [room$, invalidRoom$] = [_[0], _[1].pipe(sparse(200))]

  const loopDetected$ = merge(
    room$.pipe(map(() => "reset" as const)),
    invalidRoom$.pipe(map(() => 1))
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

  invalidRoom$.pipe(takeUntil(loopDetected$)).subscribe(async (reason) => {
    const [type] = reason
    switch (type) {
      case "invalid-id": {
        const newRoomId = roomIdZod.parse(doc(collection(db, "rooms")).id)
        window.location.replace("#" + newRoomId)
        break
      }

      case "invalid-doc": {
        const [, roomId] = reason
        await setupRoom(db, roomId)
        break
      }
    }
  })

  return room$
}
