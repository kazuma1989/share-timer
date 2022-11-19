import { addDoc } from "firebase/firestore"
import { useAllSettled } from "../useAllSettled"
import { useFirestore } from "../useFirestore"
import { ActionOnFirestore } from "../zod/actionZod"
import { Room } from "../zod/roomZod"
import { collection } from "./collection"
import { withMeta } from "./withMeta"

export function useDispatchImpl(
  roomId: Room["id"]
): [
  pending: boolean,
  dispatch: (action: ActionOnFirestore) => Promise<unknown>
] {
  const [_allSettled, addPromise] = useAllSettled()
  const pending = !_allSettled

  const db = useFirestore()

  return [
    pending,
    (action) =>
      addPromise(
        addDoc(collection(db, "rooms", roomId, "actions"), withMeta(action))
      ),
  ]
}
