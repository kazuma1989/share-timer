import { Observable, of } from "rxjs"
import { createContext } from "./createContext"
import type { TimerState } from "./timerReducer"
import type { Room } from "./zod/roomZod"

export function useTimerState(roomId: Room["id"]): Observable<TimerState> {
  return useImpl()(roomId)
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
} satisfies TimerState)
