import {
  distinctUntilChanged,
  fromEvent,
  map,
  Observable,
  startWith,
} from "rxjs"
import { shareRecent } from "./util/shareRecent"

export function observeHash(): Observable<string> {
  return fromEvent(window, "hashchange" as keyof WindowEventMap, {
    passive: true,
  }).pipe(
    startWith(null),
    map(() => window.location.hash.slice("#".length)),
    distinctUntilChanged(),
    shareRecent()
  )
}

export function setHash(hash: string): void {
  window.location.assign("#" + hash)
}

export function replaceHash(hash: string): void {
  window.location.replace("#" + hash)
}
