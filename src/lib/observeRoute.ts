import { browser } from "$app/environment"
import { goto } from "$app/navigation"
import { page } from "$app/stores"
import { distinctUntilChanged, map, Observable } from "rxjs"
import { fromRoute, toRoute, type Route } from "./toRoute"
import { shareRecent } from "./util/shareRecent"

export function observeRoute(): Observable<Route> {
  return observeHash().pipe(
    map((_) => _.slice("#".length)),
    map(toRoute)
  )
}

export function replaceRoute(route: Route): void {
  replaceHash(`#${fromRoute(route)}`)
}

function observeHash(): Observable<`#${string}`> {
  return new Observable<string>((sub) =>
    page.subscribe((_) => {
      sub.next(_.url.hash)
    })
  ).pipe(
    map((_) => (_ || "#") as `#${string}`),
    distinctUntilChanged(),
    shareRecent()
  )
}

function replaceHash(hash: `#${string}`): void {
  if (!browser) return

  goto(hash, { replaceState: true })
}
