<script lang="ts">
  import clsx from "clsx"
  import {
    combineLatestWith,
    distinctUntilChanged,
    map,
    pipe,
    scan,
    startWith,
    type Observable,
    type OperatorFunction,
  } from "rxjs"
  import { onMount } from "svelte"
  import {
    mapToCurrentDuration,
    type CurrentDuration,
  } from "./mapToCurrentDuration"
  import type { TimerState } from "./timerReducer"
  import { useDarkMode } from "./useDarkMode"
  import { bufferedLast } from "./util/bufferedLast"
  import { floor } from "./util/floor"
  import { formatDuration } from "./util/formatDuration"
  import { interval } from "./util/interval"

  const canvasWidth = 512
  const canvasHeight = 288

  function mapToDuration(): OperatorFunction<CurrentDuration, number> {
    return pipe(
      map((_) => floor(_.duration)),
      distinctUntilChanged()
    )
  }

  export let timerState$: Observable<TimerState>

  let className: string = ""
  export { className as class }

  $: duration$ = timerState$.pipe(
    bufferedLast(interval("worker", 400)),
    mapToCurrentDuration(interval("worker", 100)),
    mapToDuration()
  )

  const darkMode$ = useDarkMode()

  let _canvas: HTMLCanvasElement | undefined
  onMount(() => {
    const ctx = _canvas?.getContext("2d")
    if (!_canvas || !ctx) return
    const canvas = _canvas

    // https://developer.mozilla.org/ja/docs/Web/API/Window/devicePixelRatio
    // 表示サイズを設定（CSS におけるピクセル数です）。
    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`

    // レティナでこの値を 1 にするとぼやけた canvas になります
    const scale = window.devicePixelRatio

    // メモリ上における実際のサイズを設定（ピクセル密度の分だけ倍増させます）。
    canvas.width = Math.floor(canvasWidth * scale)
    canvas.height = Math.floor(canvasHeight * scale)
    ctx.scale(scale, scale)

    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.font = "100 128px/1 system-ui,sans-serif"

    const fillText$ = duration$.pipe(
      map((_) => formatDuration(_)),
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

    return () => {
      sub.unsubscribe()
    }
  })
</script>

<div class={clsx("bg-light dark:bg-dark", className)}>
  <canvas bind:this={_canvas} class="bg-inherit" />
</div>
