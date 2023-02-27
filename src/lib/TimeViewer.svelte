<script lang="ts">
  import clsx from "clsx"
  import {
    combineLatestWith,
    distinctUntilChanged,
    map,
    scan,
    startWith,
    type Observable,
  } from "rxjs"
  import type { Action } from "svelte/types/runtime/action"
  import { mapToCurrentDuration } from "../mapToCurrentDuration"
  import { now } from "../now"
  import type { TimerState } from "../schema/timerReducer"
  import { useDarkMode } from "../useDarkMode"
  import { useVideoTimer } from "../useVideoTimer"
  import { connectStreamTo } from "./action/connectStreamTo"
  import { prependElement } from "./action/prependElement"
  import { assertNonNullable } from "./util/assertNonNullable"
  import { bufferedLast } from "./util/bufferedLast"
  import { floor } from "./util/floor"
  import { formatDuration } from "./util/formatDuration"
  import { humanReadableLabelOf } from "./util/humanReadableLabelOf"
  import { interval } from "./util/interval"

  export let timerState$: Observable<TimerState>
  export { className as class }
  let className: string = ""

  const video = useVideoTimer()

  $: duration$ = timerState$.pipe(
    bufferedLast(interval("worker", 400).pipe(startWith(undefined))),
    mapToCurrentDuration(interval("worker", 100).pipe(map(now))),
    map((_) => floor(_.duration)),
    distinctUntilChanged()
  )

  $: durationText$ = duration$.pipe(map((_) => formatDuration(_)))

  $: video.ariaLabel = humanReadableLabelOf($duration$)

  const setStyle: Action<
    HTMLCanvasElement,
    {
      width: number
      height: number
    }
  > = (canvas, params) => {
    assertNonNullable(params)

    const ctx = canvas.getContext("2d")
    assertNonNullable(ctx)

    const { width, height } = params

    // https://developer.mozilla.org/ja/docs/Web/API/Window/devicePixelRatio
    // 表示サイズを設定（CSS におけるピクセル数です）。
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // レティナでこの値を 1 にするとぼやけた canvas になります
    const scale = window.devicePixelRatio

    // メモリ上における実際のサイズを設定（ピクセル密度の分だけ倍増させます）。
    canvas.width = Math.floor(width * scale)
    canvas.height = Math.floor(height * scale)
    ctx.scale(scale, scale)

    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.font = "100 128px/1 system-ui,sans-serif"
  }

  const darkMode$ = useDarkMode()
  const drawText: Action<HTMLCanvasElement, Observable<string>> = (
    canvas,
    text$
  ) => {
    assertNonNullable(text$)

    const ctx = canvas.getContext("2d")
    assertNonNullable(ctx)

    const canvasWidth = parseInt(canvas.style.width)
    const canvasHeight = parseInt(canvas.style.height)

    const fillText$ = text$.pipe(
      scan<string, { text: string; prevWidth: number; prevLength: number }>(
        ({ prevWidth, prevLength }, text, i) => {
          const firstTime = i === 0
          if (firstTime || text.length !== prevLength) {
            // 初回のほか、1:00:00 -> 59:59 などと変化したとき、サイズを測りなおす
            prevWidth = ctx.measureText(text).width
            prevLength = text.length
          }

          return { text, prevWidth, prevLength }
        },
        { text: "", prevWidth: 0, prevLength: 0 }
      ),
      map(({ text, prevWidth }): [text: string, x: number, y: number] => [
        text,
        (canvasWidth - prevWidth) / 2,
        canvasHeight / 2,
      ])
    )

    const style$ = darkMode$.pipe(
      startWith(null),
      map((): { color: string; backgroundColor: string } =>
        window.getComputedStyle(canvas)
      )
    )

    const sub = fillText$
      .pipe(combineLatestWith(style$))
      .subscribe(([[text, x, y], { color, backgroundColor }]) => {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)

        ctx.fillStyle = color
        ctx.fillText(text, x, y)
      })

    return {
      destroy() {
        sub.unsubscribe()
      },
    }
  }
</script>

<div
  class={clsx("bg-light dark:bg-dark", className)}
  use:prependElement={video}
>
  <canvas
    class="hidden bg-inherit"
    use:setStyle={{ width: 512, height: 288 }}
    use:drawText={durationText$}
    use:connectStreamTo={video}
  />
</div>
