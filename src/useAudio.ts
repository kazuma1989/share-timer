import { Observable } from "rxjs"
import { createContext } from "./createContext"
import { Permission } from "./observeAudioPermission"
import { createAudioBufferSourceNode } from "./util/createAudioBufferSourceNode"

export interface Audio {
  play(): PromiseLike<void>
}

export const [AudioProvider, useAudio] = createContext<Audio>("AudioProvider")

export const [MediaPermissionProvider, useMediaPermission] = createContext<
  Observable<Permission>
>("MediaPermissionProvider")

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
