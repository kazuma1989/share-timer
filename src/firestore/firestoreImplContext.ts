import { of } from "rxjs"
import { keyWithUseRoom } from "../useRoom.1"
import type { InvalidDoc, Room } from "../zod/roomZod"

export const firestoreImplContext: Map<unknown, unknown> = new Map([
  keyWithUseRoom((roomId) =>
    // TODO 本物の実装を与える
    Math.random() < 0.3
      ? of({
          id: roomId,
          name: `another mocked room (${Math.random()})`,
        } satisfies Room)
      : of(["invalid-doc", roomId] satisfies InvalidDoc)
  ),
])
