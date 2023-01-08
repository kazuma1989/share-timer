import { of } from "rxjs"
import { keyWithUseRoom } from "../useRoom.1"
import type { Room } from "../zod/roomZod"

export const firestoreImplContext: Map<unknown, unknown> = new Map([
  keyWithUseRoom((roomId) =>
    of({
      id: roomId,
      name: `another mocked room (${Math.random()})`,
    } satisfies Room)
  ),
])
