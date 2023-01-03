import { addDoc } from "firebase/firestore"
import { useAllSettled } from "../useAllSettled"
import { ActionInput } from "../zod/actionZod"
import { Room } from "../zod/roomZod"
import { toFirestore } from "./actionZodImpl"
import { collection } from "./collection"
import { useFirestore } from "./useFirestore"
import { withMeta } from "./withMeta"

export function useDispatchImpl(
  roomId: Room["id"]
): [pending: boolean, dispatch: (action: ActionInput) => Promise<unknown>] {
  const [_allSettled, addPromise] = useAllSettled()
  const pending = !_allSettled

  const db = useFirestore()

  return [
    pending,
    (action) =>
      addPromise(
        addDoc(
          collection(db, "rooms", roomId, "actions"),
          withMeta(toFirestore.parse(action))
        )
      ),
  ]
}
