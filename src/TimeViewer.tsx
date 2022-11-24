import clsx from "clsx"
import { useEffect, useRef } from "react"
import {
  distinctUntilChanged,
  map,
  Observable,
  OperatorFunction,
  pipe,
} from "rxjs"
import { CurrentDuration, mapToCurrentDuration } from "./mapToCurrentDuration"
import { observeMediaQuery } from "./observeMediaQuery"
import { TimerState } from "./timerReducer"
import { createCache } from "./util/createCache"
import { floor } from "./util/floor"
import { formatDuration } from "./util/formatDuration"
import { interval } from "./util/interval"

const darkMode$ = observeMediaQuery(
  window.matchMedia("(prefers-color-scheme: dark)")
).pipe(
  map((_) => (_.matches ? "dark" : "light")),
  distinctUntilChanged()
)

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
    timerState$.pipe(mapToCurrentDuration(interval("ui")), mapToDuration())
  )

  const canvas$ = useRef<HTMLCanvasElement>(null)

  useStartDrawing(canvas$, duration$)

  const video$ = useRef<HTMLVideoElement>(null)

  useConnectVideoWithCanvas(video$, canvas$)
  useDestroyPiP(video$)
  useRestartVideo(video$)

  return (
    <div className={clsx("bg-light dark:bg-dark", className)}>
      <video
        ref={video$}
        autoPlay
        muted
        playsInline
        width={canvasWidth}
        height={canvasHeight}
        onClick={({ currentTarget: video }) => {
          video.play()
        }}
        onDoubleClick={({ currentTarget: video }) => {
          video.requestPictureInPicture()
        }}
      />

      <canvas ref={canvas$} className="hidden bg-inherit" />
    </div>
  )
}

function useStartDrawing(
  canvas$: { current: HTMLCanvasElement | null },
  duration$: Observable<number>
): void {
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

    let color: string = "black"
    let backgroundColor: string = "white"

    const subDarkMode = darkMode$.subscribe(() => {
      const style = window.getComputedStyle(canvas)
      color = style.color
      backgroundColor = style.backgroundColor
    })

    let prevTextWidth: number | null = null
    let prevTextLength: number | null = null

    const subDuration = duration$.subscribe((duration) => {
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const durationText = formatDuration(duration)

      if (prevTextWidth === null || durationText.length !== prevTextLength) {
        // 初回のほか、1:00:00 -> 59:59 などと変化したとき、サイズを測りなおす
        prevTextWidth = ctx.measureText(durationText).width
        prevTextLength = durationText.length
      }

      const x = (canvasWidth - prevTextWidth) / 2
      const y = canvasHeight / 2

      ctx.fillStyle = color
      ctx.fillText(durationText, x, y)
    })

    return () => {
      subDarkMode.unsubscribe()
      subDuration.unsubscribe()
    }
  }, [canvas$, duration$])
}

function useConnectVideoWithCanvas(
  video$: { current: HTMLVideoElement | null },
  canvas$: { current: HTMLCanvasElement | null }
): void {
  useEffect(() => {
    const video = video$.current
    const canvas = canvas$.current
    if (!video || !canvas) return

    video.srcObject = canvas.captureStream()
  }, [canvas$, video$])
}

function useDestroyPiP(video$: { current: HTMLVideoElement | null }): void {
  useEffect(() => {
    const video = video$.current
    if (!video) return

    return () => {
      if (document.pictureInPictureElement === video) {
        document.exitPictureInPicture?.()
      }
    }
  }, [video$])
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
      }
    )

    return () => {
      abort.abort()
    }
  }, [video$])
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
