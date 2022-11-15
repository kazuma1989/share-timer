import { Observable } from "rxjs"
import { createContext } from "./createContext"
import { Permission } from "./observeAudioPermission"

export interface Audio {
  start(): void
  stop(): void
  reset(): PromiseLike<void>
}

export const [AudioProvider, useAudio] = createContext<Audio>("AudioProvider")

export const [MediaPermissionProvider, useMediaPermission] = createContext<
  Observable<Permission>
>("MediaPermissionProvider")
