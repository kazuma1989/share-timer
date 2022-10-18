import {
  getDocs,
  limitToLast,
  onSnapshot,
  query,
  startAt,
} from "firebase/firestore"
import { useSyncExternalStore } from "react"
import {
  filter,
  map,
  Observable,
  OperatorFunction,
  pairwise,
  share,
  startWith,
  timer,
} from "rxjs"
import { collection } from "./firestore/collection"
import { hasNoEstimateTimestamp } from "./firestore/hasNoEstimateTimestamp"
import { orderBy } from "./firestore/orderBy"
import { where } from "./firestore/where"
import { safeParseDocsWith } from "./safeParseDocsWith"
import { timerReducer } from "./timerReducer"
import { useFirestore } from "./useFirestore"
import { createStore, Store } from "./util/createStore"
import { mapGetOrPut } from "./util/mapGetOrPut"
import { actionZod } from "./zod/actionZod"
import { Room } from "./zod/roomZod"

export type TimerState =
  | {
      mode: "editing"
      initialDuration: number
    }
  | {
      mode: "running"
      startedAt: number
      duration: number
    }
  | {
      mode: "paused"
      restDuration: number
    }

export function useTimerState(roomId: Room["id"]): TimerState {
  const db = useFirestore()

  const store = getOrPut(roomId, () => {
    const FirstValue = Symbol("empty")
    type FirstValue = typeof FirstValue

    type StateWithMeta = [state: TimerState, timestamp: "estimate" | "server"]

    return createStore(
      new Observable<StateWithMeta>((subscriber) => {
        const abort = new AbortController()

        const getSmartQuery = () =>
          getDocs(
            query(
              collection(db, "rooms", roomId, "actions"),
              where("type", "==", "edit-done"),
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

        getSmartQuery().then((selectActions) => {
          if (abort.signal.aborted) return

          const parseDocs = safeParseDocsWith(actionZod)

          console.debug("actions listener attached")
          const unsubscribe = onSnapshot(selectActions, (snapshot) => {
            console.debug("listen %d docChanges", snapshot.docChanges().length)

            const actions = parseDocs(snapshot.docs)
            const newState = actions.reduce(timerReducer, {
              mode: "paused",
              restDuration: 0,
            })

            subscriber.next([
              newState,
              hasNoEstimateTimestamp(snapshot.metadata) ? "server" : "estimate",
            ])
          })

          abort.signal.addEventListener("abort", () => {
            console.debug("actions listener detached")
            unsubscribe()
          })
        })

        return () => {
          abort.abort()
        }
      }).pipe(
        share({
          // リスナーがいなくなって30秒後に根元の購読も解除する
          resetOnRefCountZero: () => timer(30_000),
        }),

        // 最新の値と直前の値をペアで流す
        startWith(FirstValue),
        pairwise() as OperatorFunction<
          StateWithMeta | FirstValue,
          [StateWithMeta | FirstValue, StateWithMeta]
        >,

        // UIが受け取るべき値を選別して流す
        filter(([prev, [newState, newTimestampIs]]) => {
          if (prev !== FirstValue) {
            const [prevState, prevTimestampIs] = prev

            if (
              prevTimestampIs === "estimate" &&
              prevState.mode === "running" &&
              newTimestampIs === "server" &&
              newState.mode === "running"
            ) {
              import.meta.env.DEV &&
                console.debug("skipped an estimate -> server timestamp change")

              return false
            }
          }

          return true
        }),
        map(([, [newState]]) => newState)
      )
    )
  })

  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}

const getOrPut = mapGetOrPut(new Map<Room["id"], Store<TimerState>>())
