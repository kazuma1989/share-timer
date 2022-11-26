import {
  buffer,
  filter,
  map,
  MonoTypeOperatorFunction,
  Observable,
  pipe,
} from "rxjs"

/**
 * interval$ が来るまで流れをためておき、interval$ のタイミングで回収したもののうちの最後の値を流す
 */
export function bufferedLast<T>(
  interval$: Observable<void>
): MonoTypeOperatorFunction<T> {
  return pipe(
    buffer(interval$),
    filter((_) => _.length >= 1),
    map((_) => _.at(-1)!)
  )
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
    scheduler.run(({ expectObservable, cold, hot }) => {
      const base$ = hot("123456789|")
      const interval$ = cold<void>("--1-11--1|")

      const actual$ = base$.pipe(bufferedLast(interval$))

      expectObservable(actual$).toBe("--3-56--9|")
    })
  })
}
