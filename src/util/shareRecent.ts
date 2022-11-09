import { MonoTypeOperatorFunction, shareReplay, timer } from "rxjs"

export function shareRecent<T>(
  resetAfter?: number
): MonoTypeOperatorFunction<T> {
  // リスナーがいなくなってから指定のミリ秒後に根元の購読も解除する
  const resetOnRefCountZero =
    resetAfter === undefined ? true : () => timer(resetAfter)

  return shareReplay({
    bufferSize: 1,
    // shareのresetOnRefCountZeroへのバイパスだから実態としてはOKのはず
    refCount: resetOnRefCountZero as boolean,
  })
}
