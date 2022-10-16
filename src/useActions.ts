import {
  addDoc,
  getDocs,
  limitToLast,
  onSnapshot,
  query,
  startAt,
} from "firebase/firestore"
import { useReducer, useSyncExternalStore } from "react"
import { Action, ActionOnFirestore, actionZod } from "./actionZod"
import { collection } from "./collection"
import { mapGetOrPut } from "./mapGetOrPut"
import { orderBy } from "./orderBy"
import { Room } from "./roomZod"
import { Store } from "./Store"
import { useFirestore } from "./useFirestore"
import { where } from "./where"
import { withMeta } from "./withMeta"

export function useActions(
  roomId: Room["id"]
): [
  actions: Action[],
  dispatch: (action: ActionOnFirestore) => Promise<unknown>
] {
  const db = useFirestore()

  const actions = useAsyncActions(roomId)

  const [localActions, dispatchLocal] = useReducer(
    (
      actions: Action[],
      action: ActionOnFirestore | Action[]
    ): typeof actions => {
      if (Array.isArray(action)) {
        return action
      }

      return [...actions, actionZod.parse(action)]
    },
    actions
  )

  const dispatch = (action: ActionOnFirestore) => {
    dispatchLocal(action)

    return addDoc(collection(db, "rooms", roomId, "actions"), withMeta(action))
  }

  if (isKnown(actions)) {
    return [localActions, dispatch]
  }

  dispatchLocal(actions)
  return [actions, dispatch]
}

function isKnown<T extends object>(item: T): boolean {
  const known = _knownObjects.has(item)
  _knownObjects.add(item)

  return known
}
const _knownObjects = new WeakSet()

/**
 * Firestoreからactionsコレクションの配列を取得する。
 *
 * 同期的に解決せずReact的にすこしだけラグがあるかも、ということで"Async"という名前に。
 */
function useAsyncActions(roomId: Room["id"]): Action[] {
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

  return useSyncExternalStore(store.subscribe, store.getOrThrow)
}

const getOrPut = mapGetOrPut(new Map<Room["id"], Store<Action[]>>())
