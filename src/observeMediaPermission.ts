import { fromEvent, Observable, switchMap, tap } from "rxjs"
import { checkMediaPermission, Permission } from "./util/checkMediaPermission"

export function observeMediaPermission(
  media: HTMLMediaElement
): Observable<Permission> {
  return fromEvent(document.body, "click" as keyof HTMLElementEventMap, {
    passive: true,
    once: true,
  }).pipe(
    switchMap(() => checkMediaPermission(media)),
    tap((permission) => {
      if (permission === "denied") {
        console.warn("Cannot play audio")
      }
    })
  )
}
