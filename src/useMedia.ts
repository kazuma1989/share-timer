import { Observable } from "rxjs"
import { createContext } from "./createContext"

export const [MediaProvider, useMedia] =
  createContext<Observable<[HTMLMediaElement, "canplay" | "denied"]>>(
    "MediaProvider"
  )
