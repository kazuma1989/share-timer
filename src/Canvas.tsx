import {
  distinctUntilChanged,
  map,
  Observable,
  OperatorFunction,
  pipe,
} from "rxjs"
import { CurrentDuration, mapToCurrentDuration } from "./mapToCurrentDuration"
import { TimerState } from "./timerReducer"
import { useObservable } from "./useObservable"
import { createCache } from "./util/createCache"
import { floor } from "./util/floor"
import { interval } from "./util/interval"

export function Canvas({
  timerState$,
  className,
}: {
  timerState$: Observable<TimerState>
  className?: string
}) {
  const duration$ = cache(timerState$, () =>
    timerState$.pipe(mapToCurrentDuration(interval("ui")), mapToDuration())
  )

  const duration = useObservable(duration$)

  return <canvas className={className} />
}

const cache = createCache()

function mapToDuration(): OperatorFunction<CurrentDuration, number> {
  return pipe(
    map((_) => floor(_.duration)),
    distinctUntilChanged()
  )
}
