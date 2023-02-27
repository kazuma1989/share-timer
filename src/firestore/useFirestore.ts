import { createContext } from "$lib/createContext"
import type { Remote } from "comlink"
import type { RemoteFirestore } from "./worker/RemoteFirestore.worker"

export const [keyWithFirestore, useFirestore] =
  createContext<Remote<RemoteFirestore>>("RemoteFirestore")
