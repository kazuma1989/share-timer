import { Observable, share } from "rxjs"
import IntervalWorker from "./interval.worker?worker&inline"
import { subscribeAnimationFrame } from "./subscribeAnimationFrame"

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

export function floor(v: number): number {
  return v - (v % 1000) + (v >= 0 ? 0 : -1000)
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("basic", () => {
    expect(floor(1234)).toBe(1000)
  })

  test("zero", () => {
    expect(floor(234)).toBe(0)
  })

  test("negative", () => {
    expect(floor(-1)).toBe(-1000)
  })

  test("negative 2", () => {
    expect(floor(-1234)).toBe(-2000)
  })
}
