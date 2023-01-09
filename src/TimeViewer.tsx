import clsx from "clsx"
// @ts-expect-error
import { useEffect, useRef } from "react"
import {
  combineLatestWith,
  distinctUntilChanged,
  map,
  Observable,
  pipe,
  scan,
  startWith,
  type OperatorFunction,
} from "rxjs"
import {
  mapToCurrentDuration,
  type CurrentDuration,
} from "./mapToCurrentDuration"
import type { TimerState } from "./timerReducer"
import { useDarkMode } from "./useDarkMode"
// @ts-expect-error
import { useVideoTimer } from "./useVideoTimer"
import { bufferedLast } from "./util/bufferedLast"
import { createCache } from "./util/createCache"
import { floor } from "./util/floor"
import { formatDuration } from "./util/formatDuration"
import { humanReadableLabelOf } from "./util/humanReadableLabelOf"
import { interval } from "./util/interval"

const canvasWidth = 512
const canvasHeight = 288

export function TimeViewer({
  timerState$,
  className,
}: {
  timerState$: Observable<TimerState>
  className?: string
}) {
  const duration$ = cache(timerState$, () =>
    timerState$.pipe(
      bufferedLast(interval("worker", 400)),
      mapToCurrentDuration(interval("worker", 100)),
      mapToDuration()
    )
  )

  const canvas$ = useRef<HTMLCanvasElement>(null)

  useStartDrawing(canvas$, duration$)

  const video$ = useRef(useVideoTimer())

  useSetLabel(video$, duration$)
  useConnectVideoWithCanvas(video$, canvas$)
  useRestartVideo(video$)

  const div$ = useRef<HTMLDivElement>(null)

  usePrependElement(div$, video$)

  return (
    <div ref={div$} className={clsx("bg-light dark:bg-dark", className)}>
      <canvas ref={canvas$} className="hidden bg-inherit" />
    </div>
  )
}

function useStartDrawing(
  canvas$: { current: HTMLCanvasElement | null },
  duration$: Observable<number>
): void {
  const darkMode$ = useDarkMode()

  useEffect(() => {
    const canvas = canvas$.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

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
  }, [canvas$, darkMode$, duration$])
}

function useSetLabel(
  video$: { current: HTMLVideoElement | null },
  duration$: Observable<number>
): void {
  useEffect(() => {
    const video = video$.current
    if (!video) return

    const sub = duration$.subscribe((duration) => {
      video.ariaLabel = humanReadableLabelOf(duration)
    })

    return () => {
      sub.unsubscribe()
    }
  }, [duration$, video$])
}

function useConnectVideoWithCanvas(
  video$: { current: HTMLVideoElement | null },
  canvas$: { current: HTMLCanvasElement | null }
): void {
  useEffect(() => {
    const video = video$.current
    const canvas = canvas$.current
    if (!video || !canvas) return

    video.width = canvasWidth
    video.height = canvasHeight

    video.srcObject = canvas.captureStream()
  }, [canvas$, video$])
}

function useRestartVideo(video$: { current: HTMLVideoElement | null }): void {
  useEffect(() => {
    const video = video$.current
    if (!video) return

    const abort = new AbortController()

    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.visibilityState === "visible") {
          video.play()
        }
      },
      {
        signal: abort.signal,
        passive: true,
      }
    )

    video.addEventListener(
      "leavepictureinpicture",
      () => {
        video.play()
      },
      {
        signal: abort.signal,
        passive: true,
      }
    )

    return () => {
      abort.abort()
    }
  }, [video$])
}

function usePrependElement(
  parent$: { current: HTMLElement | null },
  child$: { current: HTMLElement | null }
): void {
  useEffect(() => {
    const parent = parent$.current
    const child = child$.current
    if (!parent || !child) return

    parent.prepend(child)

    return () => {
      parent.removeChild(child)
    }
  }, [parent$, child$])
}

const cache = createCache()

function mapToDuration(): OperatorFunction<CurrentDuration, number> {
  return pipe(
    map((_) => floor(_.duration)),
    distinctUntilChanged()
  )
}

if (import.meta.vitest) {
  const { test, expect, beforeEach } = import.meta.vitest
  const { TestScheduler } = await import("rxjs/testing")

  let scheduler: InstanceType<typeof TestScheduler>
  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toStrictEqual(expected)
    })
  })

  test("basic", () => {
    scheduler.run(({ expectObservable, hot }) => {
      const base$ = hot<CurrentDuration>("--1--2--3--|", {
        1: {
          mode: "running",
          duration: 3 * 60_000 - 100,
        },
        2: {
          mode: "running",
          duration: 3 * 60_000 - 500,
        },
        3: {
          mode: "running",
          duration: 3 * 60_000 - 2_000,
        },
      })

      const actual$ = base$.pipe(mapToDuration())

      expectObservable(actual$).toBe("--1-----3--|", {
        1: 3 * 60_000 - 1_000,
        3: 3 * 60_000 - 2_000,
      })
    })
  })
}
