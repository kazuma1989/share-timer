import {
  distinctUntilChanged,
  fromEvent,
  map,
  Observable,
  shareReplay,
  startWith,
} from "rxjs"

export function observeHash(): Observable<string> {
  return fromEvent(window, "hashchange" as keyof WindowEventMap, {
    passive: true,
  }).pipe(
    startWith(null),
    map(() => window.location.hash),
    distinctUntilChanged(),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    })
  )
}

export function replaceHash(hash: string): void {
  window.location.replace("#" + hash)
}
