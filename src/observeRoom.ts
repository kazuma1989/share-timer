import { doc, Firestore } from "firebase/firestore"
import {
  map,
  Observable,
  of,
  OperatorFunction,
  partition,
  shareReplay,
  switchMap,
} from "rxjs"
import { collection } from "./firestore/collection"
import { snapshotOf } from "./util/snapshotOf"
import { Room, roomIdZod, roomZod } from "./zod/roomZod"

export function observeRoom(
  db: Firestore,
  hash$: Observable<string>
): [
  room$: Observable<Room>,
  invalid$: Observable<["invalid-id"] | ["invalid-doc", Room["id"]]>
] {
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
      shareReplay({
        bufferSize: 1,
        refCount: true,
      })
    ),
    (_): _ is Room =>
      !Array.isArray(_) || (_[0] !== "invalid-id" && _[0] !== "invalid-doc")
  )

  return _
}

export function isRoom(value: Room | InvalidDoc | InvalidId): value is Room {
  return !Array.isArray(value)
}

export type InvalidDoc = [reason: "invalid-doc", payload: Room["id"]]
export type InvalidId = [reason: "invalid-id", payload: string]

export function toRoom(
  db: Firestore
): OperatorFunction<string, Room | InvalidDoc | InvalidId> {
  return switchMap((id) => {
    const _ = roomIdZod.safeParse(id)
    if (!_.success) {
      return of<InvalidId>(["invalid-id", id])
    }

    const roomId = _.data

    return snapshotOf(doc(collection(db, "rooms"), roomId)).pipe(
      map((doc): Room | InvalidDoc => {
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
  })
}

export function observeRoom2(
  db: Firestore,
  id: string
): Observable<
  | Room
  | [reason: "invalid-doc", payload: Room["id"]]
  | [reason: "invalid-id", payload: string]
> {
  const _ = roomIdZod.safeParse(id)
  if (!_.success) {
    return of(["invalid-id", id])
  }

  const roomId = _.data

  return snapshotOf(doc(collection(db, "rooms"), roomId)).pipe(
    map((doc) => {
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
}
