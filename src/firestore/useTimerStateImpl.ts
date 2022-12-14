import {
  getDocs,
  limitToLast,
  query,
  queryEqual,
  startAt,
} from "firebase/firestore"
import { distinctUntilChanged, from, map, Observable, switchMap } from "rxjs"
import { timerReducer, TimerState } from "../timerReducer"
import { createCache } from "../util/createCache"
import { shareRecent } from "../util/shareRecent"
import { actionZod } from "../zod/actionZod"
import { Room } from "../zod/roomZod"
import { fromFirestore } from "./actionZodImpl"
import { collection } from "./collection"
import { hasNoEstimateTimestamp } from "./hasNoEstimateTimestamp"
import { orderBy } from "./orderBy"
import { safeParseDocsWith } from "./safeParseDocsWith"
import { snapshotOf } from "./snapshotOf"
import { useFirestore } from "./useFirestore"
import { where } from "./where"

export function useTimerStateImpl(roomId: Room["id"]): Observable<TimerState> {
  const db = useFirestore()

  const timerState$ = hardCache(roomId, () =>
    from(
      getDocs(
        query(
          collection(db, "rooms", roomId, "actions"),
          where("type", "==", "start"),
          orderBy("createdAt", "asc"),
          limitToLast(1)
        )
      ).then(({ docs: [doc] }) =>
        query(
          collection(db, "rooms", roomId, "actions"),
          orderBy("createdAt", "asc"),
          ...(hasNoEstimateTimestamp(doc?.metadata) ? [startAt(doc)] : [])
        )
      )
    ).pipe(
      distinctUntilChanged(queryEqual),
      switchMap((selectActions) => {
        const parseDocs = safeParseDocsWith((_) =>
          actionZod.parse(fromFirestore.parse(_))
        )

        console.debug("actions listener attached")

        return snapshotOf(selectActions).pipe(
          map((snapshot) => {
            console.debug("listen %d docChanges", snapshot.docChanges().length)

            const actions = parseDocs(snapshot.docs)

            return actions.reduce(timerReducer, {
              mode: "editing",
              initialDuration: 0,
            })
          })
        )
      }),

      shareRecent(30_000)
    )
  )

  return timerState$
}

const hardCache = createCache(true)
