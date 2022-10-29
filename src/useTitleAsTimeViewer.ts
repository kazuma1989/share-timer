import { useEffect } from "react"
import { distinctUntilChanged, map, Observable } from "rxjs"
import { mapToCurrentDuration } from "./mapToCurrentDuration"
import { TimerState } from "./timerReducer"
import { createCache } from "./util/createCache"
import { formatDuration } from "./util/formatDuration"
import { floor, interval } from "./util/interval"

export function useTitleAsTimeViewer(
  timerState$: Observable<TimerState>
): void {
  const duration$ = cache(timerState$, () =>
    timerState$.pipe(
      mapToCurrentDuration(interval("worker", 500)),
      map((_) => floor(_.duration)),
      distinctUntilChanged()
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
