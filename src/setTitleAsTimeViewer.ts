import { distinctUntilChanged, map, type Observable } from "rxjs"
import { mapToCurrentDuration } from "./mapToCurrentDuration"
import { now } from "./now"
import type { TimerState } from "./schema/timerReducer"
import { floor } from "./util/floor"
import { formatDuration } from "./util/formatDuration"
import { interval } from "./util/interval"

export function setTitleAsTimeViewer(
  timerState$: Observable<TimerState>
): () => void {
  const duration$ = timerState$.pipe(
    mapToCurrentDuration(interval("worker", 500).pipe(map(now))),
    map((_) => floor(_.duration)),
    distinctUntilChanged()
  )

  const previousTitle = window.document.title
  const sub = duration$.subscribe((duration) => {
    window.document.title = formatDuration(duration)
  })

  return () => {
    sub.unsubscribe()
    window.document.title = previousTitle
  }
}
