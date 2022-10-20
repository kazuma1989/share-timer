import {
  getDocs,
  limitToLast,
  onSnapshot,
  query,
  startAt,
} from "firebase/firestore"
import { useSyncExternalStore } from "react"
import { Observable, share, timer } from "rxjs"
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
      initialDuration: number
      restDuration: number
      startedAt: number
    }
  | {
      mode: "paused"
      initialDuration: number
      restDuration: number
    }

export function useTimerState(roomId: Room["id"]): TimerState {
  const db = useFirestore()

  const store = getOrPut(roomId, () =>
    createStore(
      new Observable<TimerState>((subscriber) => {
        const abort = new AbortController()

        const getSmartQuery = () =>
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

        getSmartQuery().then((selectActions) => {
          if (abort.signal.aborted) return

          const parseDocs = safeParseDocsWith(actionZod)

          console.debug("actions listener attached")
          const unsubscribe = onSnapshot(selectActions, (snapshot) => {
            console.debug("listen %d docChanges", snapshot.docChanges().length)

            const actions = parseDocs(snapshot.docs)
            const newState = actions.reduce(timerReducer, {
              mode: "editing",
              initialDuration: 0,
            })

            subscriber.next(newState)
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
          resetOnRefCountZero: () => timer(30000),
        })
      )
    )
  )

  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}

const getOrPut = mapGetOrPut(new Map<Room["id"], Store<TimerState>>())
