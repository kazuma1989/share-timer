import { addDoc } from "firebase/firestore"
import type { ActionInput } from "../zod/actionZod"
import type { Room } from "../zod/roomZod"
import { toFirestore } from "./actionZodImpl"
import { collection } from "./collection"
import { useFirestore } from "./useFirestore"
import { withMeta } from "./withMeta"

export function useDispatchImpl(
  roomId: Room["id"]
): [pending: boolean, dispatch: (action: ActionInput) => PromiseLike<unknown>] {
  // TODO 本物の値
  const dummyPending = false

  const db = useFirestore()

  return [
    dummyPending,
    (action) =>
      addDoc(
        collection(db, "rooms", roomId, "actions"),
        withMeta(toFirestore.parse(action))
      ),
  ]
}
