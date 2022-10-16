import { addDoc } from "firebase/firestore"
import { useCallback } from "react"
import { collection } from "./firestore/collection"
import { withMeta } from "./firestore/withMeta"
import { useFirestore } from "./useFirestore"
import { ActionOnFirestore } from "./zod/actionZod"
import { Room } from "./zod/roomZod"

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
