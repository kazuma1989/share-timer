import { fromEvent, Observable, switchMap, tap } from "rxjs"

export type Permission = "canplay" | "denied"

export function observeAudioPermission(
  context: AudioContext
): Observable<Permission> {
  return fromEvent(
    window.document,
    // https://qiita.com/zprodev/items/7fcd8335d7e8e613a01f#解決策-1
    (window.document.ontouchend
      ? "touchend"
      : "mouseup") satisfies keyof DocumentEventMap,
    {
      passive: true,
      once: true,
    }
  ).pipe(
    switchMap(() =>
      context.resume().then<Permission, Permission>(
        () => "canplay",
        () => "denied"
      )
    ),
    tap((permission) => {
      if (permission === "denied") {
        console.warn("Cannot play audio")
      }
    })
  )
}
