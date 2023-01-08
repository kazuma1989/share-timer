import { Observable, of } from "rxjs"
import { getContext, setContext } from "svelte"
import type { InvalidDoc, Room } from "./zod/roomZod"

export function useRoom(roomId: Room["id"]): Observable<Room | InvalidDoc> {
  return (getContext<typeof useRoom | undefined>(key) ?? fallback)(roomId)
}

export function provideUseRoom(useRoomImpl: typeof useRoom): void {
  setContext<typeof useRoom>(key, useRoomImpl)
}

const key = Symbol()

const fallback = () => room$

const room$ = of({
  id: "mock-id" as Room["id"],
  name: "mocked room",
} satisfies Room)
