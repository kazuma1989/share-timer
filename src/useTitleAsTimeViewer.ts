import { useEffect } from "react"
import { map, Observable } from "rxjs"
import { mapToCurrentDuration } from "./mapToCurrentDuration"
import { TimerState } from "./timerReducer"
import { createCache } from "./util/createCache"
import { formatDuration } from "./util/formatDuration"
import { interval } from "./util/interval"

export function useTitleAsTimeViewer(
  timerState$: Observable<TimerState>
): void {
  const duration$ = cache(timerState$, () =>
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

const cache = createCache()
