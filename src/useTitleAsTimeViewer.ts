import { useEffect } from "react"
import { map, Observable } from "rxjs"
import { mapToCurrentDuration } from "./mapToCurrentDuration"
import { TimerState } from "./timerReducer"
import { formatDuration } from "./util/formatDuration"
import { interval } from "./util/interval"
import { mapGetOrPut } from "./util/mapGetOrPut"

export function useTitleAsTimeViewer(
  timerState$: Observable<TimerState>
): void {
  const duration$ = getOrPut(timerState$, () =>
    timerState$.pipe(
      mapToCurrentDuration(interval("worker", 500)),
      map((_) => _.duration)
    )
  )

  useEffect(() => {
    const previousTitle = document.title
    const sub = duration$.subscribe((duration) => {
      document.title = formatDuration(duration)
    })

    return () => {
      sub.unsubscribe()
      document.title = previousTitle
    }
  }, [duration$])
}

const getOrPut = mapGetOrPut(
  new WeakMap<Observable<TimerState>, Observable<number>>()
)
