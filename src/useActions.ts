import {
  addDoc,
  getDocs,
  limitToLast,
  onSnapshot,
  query,
  startAt,
} from "firebase/firestore"
import { useCallback, useRef, useSyncExternalStore } from "react"
import { Action, ActionOnFirestore, actionZod } from "./actionZod"
import { collection } from "./collection"
import { mapGetOrPut } from "./mapGetOrPut"
import { orderBy } from "./orderBy"
import { Room } from "./roomZod"
import { Store } from "./Store"
import { useFirestore } from "./useFirestore"
import { where } from "./where"
import { withMeta } from "./withMeta"

export function useActions(roomId: Room["id"]): [Action[], Dispatch] {
  const db = useFirestore()

  const store = getOrPut(roomId, () =>
    Store.from((next) => {
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

            next(actions)
          }
        )

        abort.signal.addEventListener("abort", unsubscribe)
      })

      return () => {
        abort.abort()
      }
    })
  )

  const actions = useSyncExternalStore(store.subscribe, store.getOrThrow)
  const actions$ = useRef(actions)
  actions$.current = actions

  const dispatch = useCallback<Dispatch>(
    (action) => {
      try {
        store.next([...actions$.current, actionZod.parse(action)])
      } catch (e) {
        console.warn(e)
      }

      return addDoc(
        collection(db, "rooms", roomId, "actions"),
        withMeta<ActionOnFirestore>(action)
      )
    },
    [db, roomId, store]
  )

  return [actions, dispatch]
}

interface Dispatch {
  (action: ActionOnFirestore): Promise<unknown>
}

const getOrPut = mapGetOrPut(new Map<Room["id"], Store<Action[]>>())
