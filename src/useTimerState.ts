import { Observable, of } from "rxjs"
import { createContext } from "./createContext"
import type { TimerState } from "./timerReducer"
import type { Room } from "./zod/roomZod"

export function useTimerState(roomId: Room["id"]): Observable<TimerState> {
  return _useImpl()(roomId)
}

export const [keyWithUseTimerState, _useImpl] = createContext<
  typeof useTimerState
>("useTimerState", () => timerState$)

const timerState$ = of({
  mode: "paused",
  initialDuration: 3 * 60_000,
  restDuration: 2 * 60_000 + 47_000,
} satisfies TimerState)
