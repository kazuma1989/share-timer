import { Observable } from "rxjs"
import { createContext } from "./createContext"

export const [CurrentDurationUIProvider, useCurrentDurationUI] = createContext<
  Observable<number>
>("CurrentDurationUIProvider")

export const [CurrentDurationWorkerProvider, useCurrentDurationWorker] =
  createContext<Observable<number>>("CurrentDurationWorkerProvider")
