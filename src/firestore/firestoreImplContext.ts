import { of } from "rxjs"
import { keyWithUseRoom } from "../useRoom.1"
import { keyWithUseSetup } from "../useSetup.1"
import { setTimeout } from "../util/setTimeout"
import type { InvalidDoc, Room } from "../zod/roomZod"

export const firestoreImplContext = new Map<unknown, unknown>([
  keyWithUseRoom((roomId) =>
    // TODO 本物の実装を与える
    Math.random() < 0.3
      ? of({
          id: roomId,
          name: `another mocked room (${Math.random()})`,
        } satisfies Room)
      : of(["invalid-doc", roomId] satisfies InvalidDoc)
  ),

  keyWithUseSetup((roomId) =>
    // TODO 本物の実装を与える
    async () => {
      await setTimeout(1_000)

      console.log("setup!!", roomId)
    }
  ),
])
