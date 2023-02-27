import { floor } from "$lib/util/floor"
import { formatDuration } from "$lib/util/formatDuration"
import { interval } from "$lib/util/interval"
import { distinctUntilChanged, map, type Observable } from "rxjs"
import { mapToCurrentDuration } from "../mapToCurrentDuration"
import type { TimerState } from "../schema/timerReducer"

export function setTitleAsTimeViewer(
  timerState$: Observable<TimerState>
): () => void {
  const duration$ = timerState$.pipe(
    mapToCurrentDuration(interval("worker", 500).pipe(map(Date.now))),
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
