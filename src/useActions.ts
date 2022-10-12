import {
  doc,
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
import { Room, roomZod } from "./roomZod"
import { Store } from "./Store"
import { useFirestore } from "./useFirestore"

export function useActions(roomId: Room["id"]): Action[] {
  const db = useFirestore()

  const store = getOrPut(
    roomId,
    () =>
      new Store((onChange) => {
        const subscriptions = new Set<Unsubscribe>()
        const clearSubscriptions = () => {
          subscriptions.forEach((unsubscribe) => {
            unsubscribe()
          })
          subscriptions.clear()
        }

        const unsubscribe = onSnapshot(
          doc(collection(db, "rooms"), roomId),
          (roomDoc) => {
            clearSubscriptions()

            const room: Room = {
              ...roomZod.parse(roomDoc.data()),
              id: roomDoc.id,
            }

            subscriptions.add(
              onSnapshot(
                query(
                  collection(db, "rooms", roomId, "actions"),
                  orderBy("createdAt", "asc"),
                  startAt(room.lastEditAt)
                ),
                (doc) => {
                  const actions = doc.docs.flatMap<Action>((doc) => {
                    const data = doc.data({
                      serverTimestamps: "estimate",
                    })

                    try {
                      return [actionZod.parse(data)]
                    } catch (error) {
                      console.debug(data, error)
                      return []
                    }
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
