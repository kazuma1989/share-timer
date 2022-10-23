import { fromEvent, map, Observable, switchMap, tap } from "rxjs"
import { checkAudioPermission } from "./util/checkAudioPermission"

export function observeMedia<T extends HTMLMediaElement>(
  media: T
): Observable<[T, Awaited<ReturnType<typeof checkAudioPermission>>]> {
  return fromEvent(document.body, "click" as keyof HTMLElementEventMap, {
    passive: true,
    once: true,
  }).pipe(
    switchMap(() => checkAudioPermission(media)),
    tap((permission) => {
      if (permission === "denied") {
        console.warn("Cannot play audio")
      }
    }),
    map((permission) => [media, permission])
  )
}
