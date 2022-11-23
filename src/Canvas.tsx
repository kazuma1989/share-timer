import { useEffect, useRef } from "react"
import {
  distinctUntilChanged,
  map,
  Observable,
  OperatorFunction,
  pipe,
} from "rxjs"
import { CurrentDuration, mapToCurrentDuration } from "./mapToCurrentDuration"
import { TimerState } from "./timerReducer"
import { createCache } from "./util/createCache"
import { floor } from "./util/floor"
import { formatDuration } from "./util/formatDuration"
import { interval } from "./util/interval"

export function Canvas({
  timerState$,
  className,
}: {
  timerState$: Observable<TimerState>
  className?: string
}) {
  const duration$ = cache(timerState$, () =>
    timerState$.pipe(mapToCurrentDuration(interval("ui")), mapToDuration())
  )

  const canvas$ = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvas$.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // https://developer.mozilla.org/ja/docs/Web/API/Window/devicePixelRatio
    // 表示サイズを設定（CSS におけるピクセル数です）。
    const width = 512
    const height = 288
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // メモリ上における実際のサイズを設定（ピクセル密度の分だけ倍増させます）。
    const scale = window.devicePixelRatio // レティナでこの値を 1 にするとぼやけた canvas になります
    canvas.width = Math.floor(width * scale)
    canvas.height = Math.floor(height * scale)

    ctx.fillStyle = "black"
    ctx.font = "100 8rem/1 system-ui,sans-serif"
    ctx.textBaseline = "top"

    // CSS 上のピクセル数を前提としているシステムに合わせます。
    ctx.scale(scale, scale)

    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    const x = width / 2
    const y = height / 2

    const sub = duration$.subscribe((duration) => {
      ctx.clearRect(0, 0, width, height)

      ctx.fillStyle = "black"
      ctx.fillText(formatDuration(duration), x, y)
    })

    return () => {
      sub.unsubscribe()
    }
  }, [duration$])

  return <canvas ref={canvas$} className={className} />
}

const cache = createCache()

function mapToDuration(): OperatorFunction<CurrentDuration, number> {
  return pipe(
    map((_) => floor(_.duration)),
    distinctUntilChanged()
  )
}
