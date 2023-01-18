import { filter, map, withLatestFrom, type Observable } from "rxjs"
import { mapToCurrentDuration } from "./mapToCurrentDuration"
import { notifyFirstZero } from "./notifyFirstZero"
import { now } from "./now"
import type { TimerState } from "./schema/timerReducer"
import { interval } from "./util/interval"

export function setSoundCall(
  timerState$: Observable<TimerState>,
  enabled$: Observable<boolean>,
  play: () => void
): () => void {
  const sounding$ = timerState$.pipe(
    mapToCurrentDuration(interval("worker", 100).pipe(map(now))),
    notifyFirstZero(),
    withLatestFrom(enabled$),
    map(([notified, enabled]) => enabled && notified)
  )

  const sub = sounding$.pipe(filter((_) => _ === true)).subscribe(() => {
    play()
  })

  return () => {
    sub.unsubscribe()
  }
}
