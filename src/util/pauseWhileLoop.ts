import {
  debounceTime,
  filter,
  map,
  merge,
  mergeMap as flat,
  scan,
  share,
  startWith,
  windowToggle,
  type MonoTypeOperatorFunction,
} from "rxjs"

export function pauseWhileLoop<T>({
  criteria,
  debounce,
  onLoopDetected,
}: {
  criteria: number
  debounce: number
  onLoopDetected?(): void
}): MonoTypeOperatorFunction<T> {
  return (_$) => {
    const source$ = _$.pipe(
      share({
        resetOnRefCountZero: true,
      })
    )

    const settled$ = source$.pipe(
      debounceTime(debounce),
      startWith(null),
      map(() => "settled" as const)
    )

    const counting$ = source$.pipe(map(() => 1))

    const looping$ = merge(counting$, settled$).pipe(
      scan((acc, current) => (current === "settled" ? 0 : acc + current), 0),
      filter((count) => count >= criteria)
    )

    if (onLoopDetected) {
      looping$.subscribe(onLoopDetected)
    }

    return source$.pipe(
      windowToggle(settled$, () => looping$),
      flat((_) => _)
    )
  }
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

  test("pauseWhileLoop", () => {
    scheduler.run(({ expectObservable, hot }) => {
      const base$ = hot("12345----12345|")

      const actual$ = base$.pipe(
        pauseWhileLoop({
          criteria: 3,
          debounce: 4,
        })
      )

      expectObservable(actual$).toEqual(hot("12-------123--|"))
    })
  })
}
