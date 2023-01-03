import { addDoc, serverTimestamp } from "firebase/firestore"
import * as z from "zod"
import { useAllSettled } from "../useAllSettled"
import { ServerTimestamp } from "../util/ServerTimestamp"
import { ActionInput } from "../zod/actionZod"
import { Room } from "../zod/roomZod"
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
    (action) => {
      let _action = null
      if (action.type === "cancel") {
        _action = action
      } else {
        action satisfies z.input<typeof actionZodImpl>

        _action = actionZodImpl.parse(action)
      }

      return addPromise(
        addDoc(collection(db, "rooms", roomId, "actions"), withMeta(_action))
      )
    },
  ]
}

const actionZodImpl = z
  .object({
    at: z.instanceof(ServerTimestamp).transform(() => serverTimestamp()),
  })
  .passthrough()
