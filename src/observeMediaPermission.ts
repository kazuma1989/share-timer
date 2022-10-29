import { fromEvent, Observable, switchMap, tap } from "rxjs"
import { checkMediaPermission, Permission } from "./util/checkMediaPermission"

export function observeMediaPermission(
  media: HTMLMediaElement,
  spyTarget: HTMLElement
): Observable<Permission> {
  return fromEvent(spyTarget, "click" as keyof HTMLElementEventMap, {
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
