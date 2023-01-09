import { createContext } from "./createContext"
import type { ActionInput } from "./zod/actionZod"
import type { Room } from "./zod/roomZod"

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
