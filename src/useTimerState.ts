import {
  addDoc,
  getDocs,
  limitToLast,
  onSnapshot,
  query,
  startAt,
} from "firebase/firestore"
import { useCallback, useSyncExternalStore } from "react"
import { Action, ActionOnFirestore, actionZod } from "./actionZod"
import { collection } from "./collection"
import { mapGetOrPut } from "./mapGetOrPut"
import { orderBy } from "./orderBy"
import { Room } from "./roomZod"
import { Store } from "./Store"
import { timerReducer } from "./timerReducer"
import { useFirestore } from "./useFirestore"
import { where } from "./where"
import { withMeta } from "./withMeta"

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

  const store = getOrPut(roomId, () =>
    Store.from(function (next) {
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

        const estimate = new WeakSet<TimerState>()

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

            const hasEstimateTimestamp =
              doc.metadata.fromCache || doc.metadata.hasPendingWrites
            if (hasEstimateTimestamp) {
              estimate.add(newState)
            }

            const currentState = this.getValue()
            if (
              currentState !== Store.Empty &&
              estimate.has(currentState) &&
              currentState.mode === "running" &&
              !estimate.has(newState) &&
              newState.mode === "running"
            ) {
              import.meta.env.DEV &&
                console.debug("skipped an estimate -> settled change")

              return
            }

            next(newState)
          }
        )

        abort.signal.addEventListener("abort", unsubscribe)
      })

      return () => {
        abort.abort()
      }
    })
  )

  return useSyncExternalStore(store.subscribe, store.getOrThrow)
}

const getOrPut = mapGetOrPut(new Map<Room["id"], Store<TimerState>>())

export function useDispatchAction(
  roomId: Room["id"]
): (action: ActionOnFirestore) => Promise<unknown> {
  const db = useFirestore()

  return useCallback(
    (action) =>
      addDoc(
        collection(db, "rooms", roomId, "actions"),
        withMeta<ActionOnFirestore>(action)
      ),
    [db, roomId]
  )
}
