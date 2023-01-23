import { wrap } from "comlink"
import { Observable, share } from "rxjs"
import type { setInterval as setIntervalType } from "./interval.worker"
import IntervalWorker from "./interval.worker?worker&inline"
import { observeWorker } from "./observeWorker"

export function interval(type: "ui"): Observable<void>

export function interval(type: "worker", timeout: number): Observable<void>

export function interval(type: "ui" | "worker", ms?: number): Observable<void> {
  return (() => {
    switch (type) {
      case "ui": {
        return new Observable<void>((subscriber) =>
          subscribeAnimationFrame(() => {
            subscriber.next()
          })
        )
      }

      case "worker": {
        return observeWorker<void>((onNext) => setInterval(onNext, ms ?? 500))
      }
    }
  })().pipe(
    share({
      resetOnRefCountZero: true,
    })
  )
}

const setInterval = wrap<typeof setIntervalType>(new IntervalWorker())

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
