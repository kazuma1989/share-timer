import { shareRecent } from "$lib/util/shareRecent"
import { fromEvent, map, startWith, type Observable } from "rxjs"

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
