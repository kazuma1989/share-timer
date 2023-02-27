import { interval } from "$lib/util/interval"
import { filter, map, withLatestFrom, type Observable } from "rxjs"
import { mapToCurrentDuration } from "../mapToCurrentDuration"
import { notifyFirstZero } from "../notifyFirstZero"
import type { TimerState } from "../schema/timerReducer"

export function setSoundCall(
  timerState$: Observable<TimerState>,
  enabled$: Observable<boolean>,
  play: () => void
): () => void {
  const sounding$ = timerState$.pipe(
    mapToCurrentDuration(interval("worker", 100).pipe(map(Date.now))),
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
