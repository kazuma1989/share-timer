import { Observable, of } from "rxjs"
import { createContext } from "./createContext"
import { InvalidDoc, Room } from "./zod/roomZod"

export function useRoom(roomId: Room["id"]): Observable<Room | InvalidDoc> {
  return useImpl()(roomId)
}

export { ImplProvider as UseRoomProvider }

const [ImplProvider, useImpl] = createContext<typeof useRoom>(
  "UseRoomProvider",
  () => room$
)

const room$ = of({
  id: "mock-id" as Room["id"],
  name: "mocked room",
} satisfies Room)
