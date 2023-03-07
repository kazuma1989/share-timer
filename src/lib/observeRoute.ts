import {
  distinctUntilChanged,
  fromEvent,
  map,
  of,
  startWith,
  type Observable,
} from "rxjs"
import { fromRoute, toRoute, type Route } from "./toRoute"
import { shareRecent } from "./util/shareRecent"

export function observeRoute(): Observable<Route> {
  return observeHash().pipe(map((_) => toRoute(_.slice("#".length))))
}

export function replaceRoute(route: Route): void {
  replaceHash(`#${fromRoute(route)}`)
}

function observeHash(): Observable<`#${string}`> {
  if (!window) {
    return of("#")
  }

  return fromEvent<WindowEventMap["hashchange"]>(
    window,
    "hashchange" satisfies keyof WindowEventMap,
    { passive: true }
  ).pipe(
    map((e) => new URL(e.newURL).hash),
    startWith(window.location.hash),
    map((hash) => (hash || "#") as `#${string}`),
    distinctUntilChanged(),
    shareRecent()
  )
}

function replaceHash(hash: `#${string}`): void {
  if (!window) return

  window.location.replace(hash)
}
