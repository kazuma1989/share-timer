<script lang="ts" context="module">
  const video = document.createElement("video")
  video.setAttribute("role", "timer")

  // フォーカス可能にしておかないと VoiceOver が読んでくれない
  video.tabIndex = 0

  // 自動再生可能なように muted, playsInline はともに true.
  video.autoplay = true
  video.muted = true
  video.playsInline = true

  // controls off にしておくので、扱いやすいようなイベントをあらかじめ付与
  video.addEventListener("click", play, { passive: true })
  video.addEventListener("dblclick", requestPictureInPicture, { passive: true })

  // なるべく再生状態を維持する（タイマーの再生・停止の概念もあってややこしくなるため）
  video.addEventListener("leavepictureinpicture", play, { passive: true })
  document.addEventListener("visibilitychange", play, { passive: true })

  function play() {
    video.play()
  }
  function requestPictureInPicture() {
    video.requestPictureInPicture()
  }
</script>

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
  import type { Action } from "svelte/types/runtime/action"
  import {
    mapToCurrentDuration,
    type CurrentDuration,
  } from "./mapToCurrentDuration"
  import type { TimerState } from "./timerReducer"
  import { useDarkMode } from "./useDarkMode"
  import { bufferedLast } from "./util/bufferedLast"
  import { floor } from "./util/floor"
  import { formatDuration } from "./util/formatDuration"
  import { humanReadableLabelOf } from "./util/humanReadableLabelOf"
  import { interval } from "./util/interval"

  export let timerState$: Observable<TimerState>

  let className: string = ""
  export { className as class }

  $: duration$ = timerState$.pipe(
    bufferedLast(interval("worker", 400)),
    mapToCurrentDuration(interval("worker", 100)),
    mapToDuration()
  )

  onMount(() => {
    // FIXME たぶん duration$ がリアクティブになってない
    const sub = duration$.subscribe((duration) => {
      video.ariaLabel = humanReadableLabelOf(duration)
    })

    return () => {
      sub.unsubscribe()
    }
  })

  const canvasWidth = 512
  const canvasHeight = 288

  const darkMode$ = useDarkMode()
  const startDrawing: Action<HTMLCanvasElement> = (canvas) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

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

    // FIXME たぶん duration$ がリアクティブになってない
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

    return {
      destroy() {
        sub.unsubscribe()
      },
    }
  }

  const connectVideo: Action<HTMLCanvasElement> = (canvas) => {
    video.width = canvasWidth
    video.height = canvasHeight

    video.srcObject = canvas.captureStream()
  }

  const prependElement: Action<HTMLElement, HTMLElement> = (parent, child) => {
    if (!child) return

    parent.prepend(child)

    return {
      destroy() {
        parent.removeChild(child)
      },
    }
  }

  function mapToDuration(): OperatorFunction<CurrentDuration, number> {
    return pipe(
      map((_) => floor(_.duration)),
      distinctUntilChanged()
    )
  }
</script>

<div
  use:prependElement={video}
  class={clsx("bg-light dark:bg-dark", className)}
>
  <canvas use:startDrawing use:connectVideo class="hidden bg-inherit" />
</div>
