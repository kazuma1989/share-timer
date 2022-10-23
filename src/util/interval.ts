import { Observable, share } from "rxjs"
import IntervalWorker from "./interval.worker?worker&inline"
import { subscribeAnimationFrame } from "./subscribeAnimationFrame"

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

export function secondPrecisionEqual(left: number, right: number): boolean {
  return floor(left) === floor(right)
}

function floor(v: number): number {
  return v - (v % 1000) + (v >= 0 ? 0 : -1000)
}
