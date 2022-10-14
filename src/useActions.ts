import {
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
    Store.from((onChange) => {
      const subscriptions = new Set<Unsubscribe>()
      const clearSubscriptions = () => {
        subscriptions.forEach((unsubscribe) => {
          unsubscribe()
        })
        subscriptions.clear()
      }

      const unsubscribe = onSnapshot(
        query(
          collection(db, "rooms", roomId, "actions"),
          where("type", "==", "edit-done"),
          orderBy("createdAt", "asc"),
          limitToLast(1)
        ),
        (doc) => {
          clearSubscriptions()

          const latestEditDoneAction = doc.docs[0]!

          subscriptions.add(
            onSnapshot(
              query(
                collection(db, "rooms", roomId, "actions"),
                orderBy("createdAt", "asc"),
                startAt(latestEditDoneAction)
              ),
              (doc) => {
                console.debug("read %d actions", doc.size)

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

                onChange(actions)
              }
            )
          )
        }
      )

      return () => {
        clearSubscriptions()
        unsubscribe()
      }
    })
  )

  return useSyncExternalStore(store.subscribe, store.getOrThrow)
}

const getOrPut = mapGetOrPut(new Map<Room["id"], Store<Action[]>>())
