import { now } from "./now"

let _now = now()

export function subscribeTimer(next: () => void): () => void {
  const abort = new AbortController()

  const tick = () => {
    if (abort.signal.aborted) return

    requestAnimationFrame(tick)

    _now = now()
    next()
  }

  tick()

  return () => {
    abort.abort()
  }
}

/**
 * useSyncExternalStore で使う想定なので、現在時刻の値をキャッシュしておく必要がある。
 * （subscribe を呼んでいないのに getSnapshot の結果が変わってはいけないため）
 *
 * そのキャッシュを返すメソッド。
 */
subscribeTimer.now = (): number => _now
