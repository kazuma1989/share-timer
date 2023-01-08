import { Observable, of } from "rxjs"
import { getContext } from "svelte"
import type { InvalidDoc, Room } from "./zod/roomZod"

export function useRoom(roomId: Room["id"]): Observable<Room | InvalidDoc> {
  return (getContext<typeof useRoom | undefined>(key) ?? fallback)(roomId)
}

export function keyWithUseRoom(
  useRoomImpl: typeof useRoom
): [typeof key, typeof useRoom] {
  return [key, useRoomImpl]
}

const key = Symbol()

const fallback = () => room$

const room$ = of({
  id: "mock-id" as Room["id"],
  name: "mocked room",
} satisfies Room)
