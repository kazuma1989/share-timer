import { proxy, type ProxyMarked } from "comlink"
import { Observable } from "rxjs"

export function observeWorker<T>(
  subscribe: (
    onNext: ((data: T) => void) & ProxyMarked
  ) => (() => void) | PromiseLike<() => void>
): Observable<T> {
  return new Observable((subscriber) => {
    const unsubscribe$ = subscribe(
      proxy((data) => {
        subscriber.next(data)
      })
    )

    return async () => {
      const unsubscribe = await unsubscribe$
      unsubscribe()
    }
  })
}
