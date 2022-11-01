import { MonoTypeOperatorFunction, shareReplay, timer } from "rxjs"

export function shareRecent<T>(delay?: number): MonoTypeOperatorFunction<T> {
  // リスナーがいなくなってから指定の delay 後に根元の購読も解除する
  const resetOnRefCountZero = delay === undefined ? true : () => timer(delay)

  return shareReplay({
    bufferSize: 1,
    // shareのresetOnRefCountZeroへのバイパスだから実態としてはOKのはず
    refCount: resetOnRefCountZero as boolean,
  })
}
