import clsx from "clsx"
import { useEffect, useRef } from "react"
import {
  combineLatestWith,
  distinctUntilChanged,
  map,
  Observable,
  OperatorFunction,
  pipe,
  scan,
  startWith,
  throttleTime,
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
    timerState$.pipe(
      mapToCurrentDuration(interval("ui")),
      mapToDuration(),
      throttleTime(300, undefined, { leading: true })
    )
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

    const fillText$ = duration$.pipe(
      map((_) => formatDuration(_)),
      scan<
        string,
        { text: string; prevTextWidth: number; prevTextLength: number }
      >(
        ({ prevTextWidth, prevTextLength }, text, i) => {
          const firstTime = i === 0
          if (firstTime || text.length !== prevTextLength) {
            // 初回のほか、1:00:00 -> 59:59 などと変化したとき、サイズを測りなおす
            prevTextWidth = ctx.measureText(text).width
            prevTextLength = text.length
          }

          return { text, prevTextWidth, prevTextLength }
        },
        { text: "", prevTextWidth: 0, prevTextLength: 0 }
      ),
      map(({ text, prevTextWidth }): [text: string, x: number, y: number] => [
        text,
        (canvasWidth - prevTextWidth) / 2,
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
