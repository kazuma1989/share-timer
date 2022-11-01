import { MonoTypeOperatorFunction, shareReplay, timer } from "rxjs"

export function shareRecent<T>(): MonoTypeOperatorFunction<T> {
  // リスナーがいなくなって30秒後に根元の購読も解除する
  const resetOnRefCountZero = () => timer(30_000)

  return shareReplay({
    bufferSize: 1,
    // @ts-expect-error shareのresetOnRefCountZeroへのバイパスだから実態としてはOKのはず
    refCount: resetOnRefCountZero as boolean,
  })
}
