import type { Observable } from "rxjs"
import { createContext } from "./createContext"
import type { Permission } from "./observeAudioPermission"
import { createAudioBufferSourceNode } from "./util/createAudioBufferSourceNode"

export interface Audio {
  play(): PromiseLike<void>
}

export const [AudioProvider, useAudio] = createContext<Audio>("AudioProvider")

export const [keyWithMediaPermission, useMediaPermission] =
  createContext<Observable<Permission>>("MediaPermission")

export function createAudio(
  context: BaseAudioContext,
  audioData: ArrayBuffer
): Audio {
  let sourceNode: AudioBufferSourceNode

  const reset = async () => {
    sourceNode = await createAudioBufferSourceNode(context, audioData)
  }
  reset()

  return {
    async play() {
      sourceNode.start()

      await reset()
    },
  }
}
