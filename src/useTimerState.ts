import { Observable, of } from "rxjs"
import { createContext } from "./createContext"
import { TimerState } from "./timerReducer"
import { Room } from "./zod/roomZod"

export function useTimerState(room$: Observable<Room>): Observable<TimerState> {
  return useImpl()(room$)
}

export { ImplProvider as UseTimerStateProvider }

const [ImplProvider, useImpl] = createContext<typeof useTimerState>(
  "UseTimerStateProvider",
  () => timerState$
)

const timerState$ = of({
  mode: "paused",
  initialDuration: 3 * 60_000,
  restDuration: 2 * 60_000 + 47_000,
} as TimerState)
