import type { Remote } from "comlink"
import { createContext } from "../createContext"
import type { RemoteFirestore } from "./worker"

export const [keyWithFirestore, useFirestore] =
  createContext<Remote<RemoteFirestore>>("RemoteFirestore")
