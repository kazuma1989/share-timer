import { Observable } from "rxjs"
import { createContext } from "./createContext"
import { TimerState } from "./timerReducer"

export const [TimerStateProvider, useTimerState] =
  createContext<Observable<TimerState>>("TimerStateProvider")
