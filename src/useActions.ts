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
import { useFirestore } from "./useFirestore"
import { where } from "./where"
import { withMeta } from "./withMeta"

export function useActions(roomId: Room["id"]): Action[] {
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
            const changes = doc.docChanges()

            // actionsはaddedしか起きないはずなので、modifiedになるのはローカルの変更がサーバーに同期され、
            // serverTimestamps: "estimate" が解決したとき。
            // どこかで帳尻が合うはずなので、UIのちらつき低減を優先してみる。
            const onlyIncludeServerTimestampSettlements = changes.every(
              (_) => _.type === "modified"
            )
            if (onlyIncludeServerTimestampSettlements) return

            console.debug("listen %d docChanges", changes.length)

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

  return useSyncExternalStore(store.subscribe, store.getOrThrow)
}

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

const getOrPut = mapGetOrPut(new Map<Room["id"], Store<Action[]>>())
