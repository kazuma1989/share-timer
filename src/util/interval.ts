import { Observable, share } from "rxjs"
import IntervalWorker from "./interval.worker?worker&inline"

export function interval(type: "ui"): Observable<void>

export function interval(type: "worker", timeout: number): Observable<void>

export function interval(
  type: "ui" | "worker",
  timeout?: number
): Observable<void> {
  return new Observable<void>((subscriber) => {
    switch (type) {
      case "ui": {
        return subscribeAnimationFrame(() => {
          subscriber.next()
        })
      }

      case "worker": {
        const worker = new IntervalWorker()
        worker.addEventListener("message", () => {
          subscriber.next()
        })
        worker.postMessage(["start", timeout ?? 500])

        return () => {
          worker.terminate()
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
