import { createContext } from "./createContext"
import type { ActionInput } from "./schema/actionSchema"
import type { Room } from "./schema/roomSchema"

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
