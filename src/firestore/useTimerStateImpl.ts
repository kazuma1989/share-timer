import {
  getDocs,
  limitToLast,
  query,
  queryEqual,
  startAt,
} from "firebase/firestore"
import { distinctUntilChanged, map, Observable, switchMap } from "rxjs"
import { timerReducer, TimerState } from "../timerReducer"
import { createCache } from "../util/createCache"
import { safeParseDocsWith } from "../util/safeParseDocsWith"
import { shareRecent } from "../util/shareRecent"
import { snapshotOf } from "../util/snapshotOf"
import { actionZod } from "../zod/actionZod"
import { Room } from "../zod/roomZod"
import { collection } from "./collection"
import { hasNoEstimateTimestamp } from "./hasNoEstimateTimestamp"
import { orderBy } from "./orderBy"
import { useFirestore } from "./useFirestore"
import { where } from "./where"

export function useTimerStateImpl(
  room$: Observable<Room>
): Observable<TimerState> {
  const db = useFirestore()

  const timerState$ = cache(room$, () =>
    room$.pipe(
      map((_) => _.id),
      distinctUntilChanged(),
      switchMap((roomId) =>
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
      ),

      distinctUntilChanged(queryEqual),
      switchMap((selectActions) => {
        const parseDocs = safeParseDocsWith(actionZod)

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

const cache = createCache()
