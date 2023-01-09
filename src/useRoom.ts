import { Observable, of } from "rxjs"
import { createContext } from "./createContext"
import type { InvalidDoc, Room } from "./zod/roomZod"

export function useRoom(roomId: Room["id"]): Observable<Room | InvalidDoc> {
  return _useImpl()(roomId)
}

export const [keyWithUseRoom, _useImpl] = createContext<typeof useRoom>(
  "useRoom",
  () => room$
)

const room$ = of({
  id: "mock-id" as Room["id"],
  name: "mocked room",
} satisfies Room)
