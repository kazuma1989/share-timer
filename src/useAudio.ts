import { Observable } from "rxjs"
import { createContext } from "./createContext"
import { Permission } from "./util/checkMediaPermission"

export const [AudioProvider, useAudio] =
  createContext<HTMLAudioElement>("AudioProvider")

export const [MediaPermissionProvider, useMediaPermission] = createContext<
  Observable<Permission>
>("MediaPermissionProvider")
