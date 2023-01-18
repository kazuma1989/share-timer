import { proxy, wrap } from "comlink"
import { Observable, share } from "rxjs"
import type { RemoteInterval } from "./RemoteInterval.worker"
import RemoteIntervalWorker from "./RemoteInterval.worker?worker&inline"

export function interval(type: "ui"): Observable<void>

export function interval(type: "worker", timeout: number): Observable<void>

export function interval(type: "ui" | "worker", ms?: number): Observable<void> {
  return new Observable<void>((subscriber) => {
    switch (type) {
      case "ui": {
        return subscribeAnimationFrame(() => {
          subscriber.next()
        })
      }

      case "worker": {
        const Interval = wrap<typeof RemoteInterval>(new RemoteIntervalWorker())

        const unsubscribe$ = new Interval().then((interval) =>
          interval.setInterval(
            proxy(() => {
              subscriber.next()
            }),
            ms ?? 500
          )
        )

        return async () => {
          const unsubscribe = await unsubscribe$
          unsubscribe()
        }
      }
    }
  }).pipe(
    share({
      resetOnRefCountZero: true,
    })
  )
}

function subscribeAnimationFrame(next: () => void): () => void {
  const abort = new AbortController()

  const tick = () => {
    if (abort.signal.aborted) return

    next()
    requestAnimationFrame(tick)
  }

  tick()

  return () => {
    abort.abort()
  }
}
