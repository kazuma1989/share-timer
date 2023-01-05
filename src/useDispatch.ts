import { createContext } from "./createContext"
import { ActionInput } from "./zod/actionZod"
import { Room } from "./zod/roomZod"

export function useDispatch(
  roomId: Room["id"]
): [pending: boolean, dispatch: (action: ActionInput) => Promise<unknown>] {
  return useImpl()(roomId)
}

export { ImplProvider as UseDispatchProvider }

const [ImplProvider, useImpl] = createContext<typeof useDispatch>(
  "UseDispatchProvider",
  () => [pending, dispatch]
)

const pending = false
const dispatch = async () => {}
