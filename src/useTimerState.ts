import {
  getDocs,
  limitToLast,
  onSnapshot,
  query,
  startAt,
} from "firebase/firestore"
import { useSyncExternalStore } from "react"
import {
  firstValueFrom,
  fromEventPattern,
  OperatorFunction,
  pairwise,
  share,
  startWith,
  timer,
} from "rxjs"
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

  const [subscribe, getSnapshot] = getOrPut(roomId, () => {
    const Empty = Symbol("empty")
    type Empty = typeof Empty

    type X = [state: TimerState, timestamp: "estimate" | "server"]

    const x = fromEventPattern<X>(
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

              const x: X = [
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
      startWith(Empty),
      pairwise() as OperatorFunction<X | Empty, [X | Empty, X]>,
      share({
        // リスナーがいなくなって30秒後に根元の購読も解除する
        resetOnRefCountZero: () => timer(30_000),
      })
    )

    let currentState: TimerState | Empty = Empty

    return [
      () => {
        const s = x.subscribe(([prev, [newState, newTimestampIs]]) => {
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
              return
            }
          }

          currentState = newState
        })

        return () => {
          s.unsubscribe()
        }
      },

      () => {
        if (currentState !== Empty) {
          return currentState
        }

        throw firstValueFrom(x).then(([, [newState]]) => {
          currentState = newState
        })
      },
    ]
  })

  return useSyncExternalStore(subscribe, getSnapshot)
}

const getOrPut = mapGetOrPut(
  new Map<
    Room["id"],
    [
      subscribe: (onStoreChange: () => void) => () => void,
      getSnapshot: () => TimerState
    ]
  >()
)
