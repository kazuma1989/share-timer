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
  fromEventPattern,
  map,
  OperatorFunction,
  pairwise,
  share,
  startWith,
  timer,
} from "rxjs"
import { createStore, Store } from "./createStore"
import { collection } from "./firestore/collection"
import { orderBy } from "./firestore/orderBy"
import { where } from "./firestore/where"
import { timerReducer } from "./timerReducer"
import { useFirestore } from "./useFirestore"
import { mapGetOrPut } from "./util/mapGetOrPut"
import { Action, actionZod } from "./zod/actionZod"
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
    const Empty = Symbol("empty")
    type Empty = typeof Empty

    type StateWithMeta = [state: TimerState, timestamp: "estimate" | "server"]

    return createStore(
      fromEventPattern<StateWithMeta>(
        (next) => {
          console.debug("actions listener attached")

          const abort = new AbortController()

          getDocs(
            query(
              collection(db, "rooms", roomId, "actions"),
              where("type", "==", "edit-done"),
              orderBy("createdAt", "asc"),
              limitToLast(1)
            )
          ).then((doc) => {
            if (abort.signal.aborted) return

            const _ = doc.docs[0]
            const serverTimestampCommitted =
              _ && !_.metadata.fromCache && !_.metadata.hasPendingWrites
            const startAtLatestEditDone = serverTimestampCommitted
              ? [startAt(_)]
              : []

            const unsubscribe = onSnapshot(
              query(
                collection(db, "rooms", roomId, "actions"),
                orderBy("createdAt", "asc"),
                ...startAtLatestEditDone
              ),
              (doc) => {
                console.debug("listen %d docChanges", doc.docChanges().length)

                const actions = doc.docs.flatMap<Action>((doc) => {
                  const rawData = doc.data({
                    serverTimestamps: "estimate",
                  })

                  const parsed = actionZod.safeParse(rawData)
                  if (parsed.success) {
                    return [parsed.data]
                  }

                  console.debug(rawData, parsed.error)
                  return []
                })

                const newState = actions.reduce(timerReducer, {
                  mode: "paused",
                  restDuration: 0,
                })

                const x: StateWithMeta = [
                  newState,
                  doc.metadata.fromCache || doc.metadata.hasPendingWrites
                    ? "estimate"
                    : "server",
                ]
                next(x)
              }
            )

            abort.signal.addEventListener("abort", unsubscribe)
          })

          return () => {
            abort.abort()
          }
        },
        (_, abort) => {
          console.error("aborted!!")
          abort()
        }
      ).pipe(
        share({
          // リスナーがいなくなって30秒後に根元の購読も解除する
          resetOnRefCountZero: () => timer(30_000),
        }),

        // 最新の値と直前の値をペアで流す
        startWith(Empty),
        pairwise() as OperatorFunction<
          StateWithMeta | Empty,
          [StateWithMeta | Empty, StateWithMeta]
        >,

        // UIが受け取るべき値を選別して流す
        filter(([prev, [newState, newTimestampIs]]) => {
          if (prev !== Empty) {
            const [prevState, prevTimestampIs] = prev

            if (
              prevTimestampIs === "estimate" &&
              prevState.mode === "running" &&
              newTimestampIs === "server" &&
              newState.mode === "running"
            ) {
              import.meta.env.DEV &&
                console.debug("skipped an estimate -> settled change")

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
