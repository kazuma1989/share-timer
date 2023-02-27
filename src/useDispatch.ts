import { createContext } from "$lib/createContext"
import type { ActionInput } from "$lib/schema/actionSchema"
import type { Room } from "$lib/schema/roomSchema"

export function useDispatch(
  roomId: Room["id"]
): [pending: boolean, dispatch: (action: ActionInput) => PromiseLike<unknown>] {
  return _useImpl()(roomId)
}

export const [keyWithUseDispatch, _useImpl] = createContext<typeof useDispatch>(
  "useDispatch",
  () => [pending, dispatch]
)

const pending = false
const dispatch = async () => {}
