import { addDoc } from "firebase/firestore"
import { useCallback } from "react"
import { ActionOnFirestore } from "./actionZod"
import { collection } from "./collection"
import { Room } from "./roomZod"
import { useFirestore } from "./useFirestore"
import { withMeta } from "./withMeta"

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
