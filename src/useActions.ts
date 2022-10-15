import {
  getDocs,
  limitToLast,
  onSnapshot,
  query,
  startAt,
  Unsubscribe,
} from "firebase/firestore"
import { useSyncExternalStore } from "react"
import { Action, actionZod } from "./actionZod"
import { collection } from "./collection"
import { mapGetOrPut } from "./mapGetOrPut"
import { orderBy } from "./orderBy"
import { Room } from "./roomZod"
import { Store } from "./Store"
import { useFirestore } from "./useFirestore"
import { where } from "./where"

export function useActions(roomId: Room["id"]): Action[] {
  const db = useFirestore()

  const store = getOrPut(roomId, () =>
    Store.from((next) => {
      console.debug("actions listener attached")

      const subscriptions = new Set<Unsubscribe>()
      const clearSubscriptions = () => {
        subscriptions.forEach((unsubscribe) => {
          unsubscribe()
        })
        subscriptions.clear()
      }

      getDocs(
        query(
          collection(db, "rooms", roomId, "actions"),
          where("type", "==", "edit-done"),
          orderBy("createdAt", "asc"),
          limitToLast(1)
        )
      ).then((doc) => {
        clearSubscriptions()

        const [latestEditDoneAction] = doc.docs

        subscriptions.add(
          onSnapshot(
            query(
              collection(db, "rooms", roomId, "actions"),
              orderBy("createdAt", "asc"),
              ...(latestEditDoneAction ? [startAt(latestEditDoneAction)] : [])
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
        )
      })

      return clearSubscriptions
    })
  )

  return useSyncExternalStore(store.subscribe, store.getOrThrow)
}

const getOrPut = mapGetOrPut(new Map<Room["id"], Store<Action[]>>())
