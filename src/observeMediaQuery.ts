import { fromEvent, map, startWith } from "rxjs"
import { shareRecent } from "./util/shareRecent"

export function observeMediaQuery(mql: MediaQueryList) {
  return fromEvent<MediaQueryListEvent>(
    mql,
    "change" satisfies keyof MediaQueryListEventMap
  ).pipe(
    startWith(null),
    map(() => mql),
    shareRecent()
  )
}
