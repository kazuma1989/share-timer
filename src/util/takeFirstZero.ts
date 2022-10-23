import {
  MonoTypeOperatorFunction,
  pipe,
  skipWhile,
  take,
  takeWhile,
} from "rxjs"

export function takeFirstZero(): MonoTypeOperatorFunction<number> {
  return pipe(
    takeWhile((_) => _ >= -150),
    skipWhile((_) => _ > 50),
    take(1)
  )
}
