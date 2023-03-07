import { fromEvent, map, startWith, type Observable } from "rxjs"
import { shareRecent } from "./shareRecent"

export function observeMediaQuery(
  mql: MediaQueryList
): Observable<MediaQueryList> {
  return fromEvent<MediaQueryListEvent>(
    mql,
    "change" satisfies keyof MediaQueryListEventMap
  ).pipe(
    startWith(null),
    map(() => mql),
    shareRecent()
  )
}
