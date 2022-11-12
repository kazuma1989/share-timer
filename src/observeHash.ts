import {
  distinctUntilChanged,
  fromEvent,
  map,
  Observable,
  startWith,
} from "rxjs"
import { fromRoute, Route, toRoute } from "./mapToRoute"
import { shareRecent } from "./util/shareRecent"

export function observeHash(): Observable<Route> {
  return fromEvent(window, "hashchange" as keyof WindowEventMap, {
    passive: true,
  }).pipe(
    startWith(null),
    map(() => window.location.hash.slice("#".length)),
    distinctUntilChanged(),
    map(toRoute),
    shareRecent()
  )
}

export function setHash(route: Route): void {
  window.location.assign("#" + fromRoute(route))
}

export function replaceHash(route: Route): void {
  window.location.replace("#" + fromRoute(route))
}
