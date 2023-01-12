import type { ActionInput } from "../zod/actionZod"
import type { Room } from "../zod/roomZod"
import { useFirestore } from "./useFirestore"

export function useDispatchImpl(
  roomId: Room["id"]
): [pending: boolean, dispatch: (action: ActionInput) => PromiseLike<unknown>] {
  // TODO 本物の値
  const dummyPending = false

  const firestore = useFirestore()

  return [dummyPending, (action) => firestore.dispatch(roomId, action)]
}
