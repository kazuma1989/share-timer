import { concatMap, delay, MonoTypeOperatorFunction, of } from "rxjs"

/**
 * 流れをすべて拾うものの、流れの間隔を interval 以上に保ち、過剰な流入を防ぐ
 */
export function sparse<T>(interval: number): MonoTypeOperatorFunction<T> {
  return concatMap((_) => of(_).pipe(delay(interval)))
}

if (import.meta.vitest) {
  const { test, expect, beforeEach } = import.meta.vitest
  const { TestScheduler } = await import("rxjs/testing")

  let scheduler: InstanceType<typeof TestScheduler>
  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toStrictEqual(expected)
    })
  })

  test("basic", () => {
    scheduler.run(({ expectObservable, hot }) => {
      const base$ = hot("1 2 3 |")

      const actual$ = base$.pipe(sparse(10))

      expectObservable(actual$).toBe("10ms 1 9ms 2 9ms (3|)")
    })
  })
}
