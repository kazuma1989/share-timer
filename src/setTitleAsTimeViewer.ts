import { distinctUntilChanged, map, Observable } from "rxjs"
import { mapToCurrentDuration } from "./mapToCurrentDuration"
import { now } from "./now"
import type { TimerState } from "./timerReducer"
import { floor } from "./util/floor"
import { formatDuration } from "./util/formatDuration"
import { interval } from "./util/interval"

export function setTitleAsTimeViewer(
  timerState$: Observable<TimerState>
): () => void {
  const duration$ = timerState$.pipe(
    mapToCurrentDuration(interval("worker", 500), now),
    map((_) => floor(_.duration)),
    distinctUntilChanged()
  )

  const previousTitle = document.title
  const sub = duration$.subscribe((duration) => {
    document.title = formatDuration(duration)
  })

  return () => {
    sub.unsubscribe()
    document.title = previousTitle
  }
}
