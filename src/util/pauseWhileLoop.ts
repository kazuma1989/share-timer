import {
  debounceTime,
  filter,
  map,
  merge,
  mergeMap,
  MonoTypeOperatorFunction,
  Observable,
  scan,
  share,
  startWith,
  windowToggle,
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
  return (source$) => {
    const [looping$, settled$] = detectLoop(source$, criteria, debounce)

    if (onLoopDetected) {
      looping$.subscribe(onLoopDetected)
    }

    return source$.pipe(
      windowToggle(settled$, () => looping$),
      mergeMap((_) => _)
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

      expectObservable(actual$).toEqual(hot("12-------12---|"))
    })
  })
}

function detectLoop(
  target$: Observable<unknown>,
  criteria: number,
  debounce: number
): [looping$: Observable<number>, settled$: Observable<number>] {
  const hot$ = target$.pipe(share())

  const settled$ = hot$.pipe(
    debounceTime(debounce),
    startWith(null),
    map(() => 0)
  )

  const looping$ = merge(hot$.pipe(map(() => 1)), settled$).pipe(
    scan((acc, current) => {
      if (current === 0) {
        return 0
      }

      return acc + current
    }, 0),
    filter((count) => count >= criteria)
  )

  return [looping$, settled$]
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

  test("detectLoop", () => {
    scheduler.run(({ expectObservable, hot }) => {
      const base$ = hot("1234---5-----1234|")

      const [looping$, settled$] = detectLoop(base$, 3, 5)

      expectObservable(looping$).toEqual(
        hot("--34---5-------34|").pipe(map((_) => Number(_)))
      )

      expectObservable(settled$).toEqual(
        hot("0-----------0----(0|)").pipe(map((_) => Number(_)))
      )
    })
  })
}
