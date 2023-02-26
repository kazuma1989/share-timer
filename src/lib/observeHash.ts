import {
  distinctUntilChanged,
  fromEvent,
  map,
  of,
  startWith,
  type Observable,
} from "rxjs"
import { fromRoute, toRoute, type Route } from "./toRoute"
import { shareRecent } from "../util/shareRecent"

function observeHash(): Observable<string> {
  if (!globalThis.window) {
    return of("")
  }

  const window = globalThis.window

  return fromEvent(window, "hashchange" satisfies keyof WindowEventMap, {
    passive: true,
  }).pipe(
    startWith(null),
    map(() => window.location.hash.slice("#".length)),
    distinctUntilChanged(),
    shareRecent()
  )
}

export function observeRoute(): Observable<Route> {
  return observeHash().pipe(map(toRoute))
}

export function setHash(route: Route): void {
  window.location.assign("#" + fromRoute(route))
}

export function replaceHash(route: Route): void {
  window.location.replace("#" + fromRoute(route))
}
