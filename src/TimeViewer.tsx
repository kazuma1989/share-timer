import { distinctUntilChanged, map, Observable } from "rxjs"
import { toCurrentDuration } from "./observeCurrentDuration"
import { TimerState } from "./timerReducer"
import { useObservable } from "./useObservable"
import { formatDuration } from "./util/formatDuration"
import { floor, interval } from "./util/interval"
import { mapGetOrPut } from "./util/mapGetOrPut"
import { shallowEqual } from "./util/shallowEqual"

export function TimeViewer({
  timerState$,
  className,
}: {
  timerState$: Observable<TimerState>
  className?: string
}) {
  console.count("TimeViewer")

  const duration$ = getOrPut(timerState$, () =>
    timerState$.pipe(
      toCurrentDuration(interval("ui")),
      map((_) => ({
        mode: _.mode,
        duration: floor(_.duration),
      })),
      distinctUntilChanged(shallowEqual),
      map((_) => _.duration)
    )
  )

  const duration = useObservable(duration$)

  return <span className={className}>{formatDuration(duration)}</span>
}

const getOrPut = mapGetOrPut(
  new WeakMap<Observable<TimerState>, Observable<number>>()
)
