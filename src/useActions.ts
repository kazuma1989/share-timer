import {
  doc,
  onSnapshot,
  query,
  startAt,
  Unsubscribe,
} from "firebase/firestore"
import { useSyncExternalStore } from "react"
import { collection } from "./collection"
import { mapGetOrPut } from "./mapGetOrPut"
import { orderBy } from "./orderBy"
import { Store } from "./Store"
import { TimerAction, timerAction } from "./timerAction"
import { useFirestore } from "./useFirestore"
import { Room, roomZod } from "./useRoomId"

const getOrPut = mapGetOrPut(new Map<Room["id"], Store<TimerAction[]>>())

export function useActions(roomId: Room["id"]): TimerAction[] {
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
            const room: Room = {
              ...roomZod.parse(roomDoc.data()),
              id: roomDoc.id,
            }

            clearSubscriptions()

            subscriptions.add(
              onSnapshot(
                query(
                  collection(db, "rooms", roomId, "actions"),
                  orderBy("createdAt", "asc"),
                  startAt(room.lastEditAt)
                ),
                (doc) => {
                  const actions = doc.docs.flatMap<TimerAction>((doc) => {
                    const data = doc.data({
                      serverTimestamps: "estimate",
                    })

                    try {
                      return [timerAction.parse(data)]
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
