import {
  Firestore,
  getDocs,
  limitToLast,
  query,
  queryEqual,
  startAt,
} from "firebase/firestore"
import {
  distinctUntilChanged,
  map,
  OperatorFunction,
  pipe,
  shareReplay,
  switchMap,
} from "rxjs"
import { collection } from "./firestore/collection"
import { hasNoEstimateTimestamp } from "./firestore/hasNoEstimateTimestamp"
import { orderBy } from "./firestore/orderBy"
import { where } from "./firestore/where"
import { timerReducer, TimerState } from "./timerReducer"
import { safeParseDocsWith } from "./util/safeParseDocsWith"
import { snapshotOf } from "./util/snapshotOf"
import { actionZod } from "./zod/actionZod"
import { Room } from "./zod/roomZod"

export function toTimerState(
  db: Firestore
): OperatorFunction<Room["id"], TimerState> {
  return pipe(
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

    shareReplay(1)
  )
}
