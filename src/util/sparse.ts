import { concatMap, delay, MonoTypeOperatorFunction, of } from "rxjs"

/**
 * 流れをすべて拾うものの、流れの間隔を interval 以上に保ち、過剰な流入を防ぐ
 */
export function sparse<T>(interval: number): MonoTypeOperatorFunction<T> {
  return concatMap((_) => of(_).pipe(delay(interval)))
}
