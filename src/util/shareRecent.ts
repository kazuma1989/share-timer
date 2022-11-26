import { MonoTypeOperatorFunction, shareReplay, timer } from "rxjs"

export function shareRecent<T>(
  resetAfter: number | boolean = true
): MonoTypeOperatorFunction<T> {
  // リスナーがいなくなってから指定のミリ秒後に根元の購読も解除する
  const resetOnRefCountZero =
    typeof resetAfter === "number" ? () => timer(resetAfter) : resetAfter

  return shareReplay({
    bufferSize: 1,
    // shareのresetOnRefCountZeroへのバイパスだから実態としてはOKのはず
    refCount: resetOnRefCountZero as boolean,
  })
}
