import type { ActionInput } from "../schema/actionSchema"
import type { Room } from "../schema/roomSchema"
import { useFirestore } from "./useFirestore"

export function useDispatchImpl(
  roomId: Room["id"]
): [pending: boolean, dispatch: (action: ActionInput) => PromiseLike<unknown>] {
  // TODO 本物の値
  const dummyPending = false

  const firestore = useFirestore()

  return [dummyPending, (action) => firestore.dispatch(roomId, action)]
}
