import clsx from "clsx"
import { serverTimestamp } from "firebase/firestore"
import { useEffect, useId, useRef } from "react"
import { Observable } from "rxjs"
import { CircleButton } from "./CircleButton"
import { DurationSelect } from "./DurationSelect"
import { icon } from "./icon"
import { now } from "./now"
import { setHash } from "./observeHash"
import { getItem, setItem } from "./storage"
import { TimerState } from "./timerReducer"
import { TimeViewer } from "./TimeViewer"
import { TransparentButton } from "./TransparentButton"
import { useMediaPermission } from "./useAudio"
import { toggleConfig, useConfig } from "./useConfig"
import { useDispatch } from "./useDispatch"
import { useObservable } from "./useObservable"
import { humanReadableLabelOf } from "./util/humanReadableLabelOf"
import { Room } from "./zod/roomZod"

export function Timer({
  room$,
  timerState$,
  className,
}: {
  room$: Observable<Room>
  timerState$: Observable<TimerState>
  className?: string
}) {
  const { id: roomId, name: roomName, lockedBy } = useObservable(room$)
  const locked = lockedBy && lockedBy !== getItem("userId")

  const state = useObservable(timerState$)

  const [pending, dispatch] = useDispatch(roomId)

  const durationSelect$ = useRef({
    value: state.initialDuration,
  })
  const primaryButton$ = useRef<HTMLButtonElement>(null)

  const _id = useId()
  const id = (_: "timer" | "status") => _id + _

  return (
    <>
      <div className={clsx("grid grid-rows-[auto_5fr_auto_4fr]", className)}>
        <div className="pt-2 text-center">
          <h1 aria-label={`タイマーの名前: ${roomName}`}>{roomName}</h1>
        </div>

        <form
          className="contents"
          onSubmit={async (e) => {
            e.preventDefault()

            if (state.mode !== "editing") return

            dispatch({
              type: "start",
              withDuration: durationSelect$.current.value,
              at: serverTimestamp(),
            })

            primaryButton$.current?.focus()
          }}
        >
          <p id={id("status")} role="status" className="sr-only">
            {((): string => {
              switch (state.mode) {
                case "editing": {
                  return `タイマーは編集中です。値は${humanReadableLabelOf(
                    state.initialDuration
                  )}`
                }

                case "running": {
                  return `タイマーは実行中です。残り${humanReadableLabelOf(
                    state.restDuration - (now() - state.startedAt)
                  )}`
                }

                case "paused": {
                  return `タイマーは一時停止中です。残り${humanReadableLabelOf(
                    state.restDuration
                  )}`
                }
              }
            })()}
          </p>

          <div
            id={id("timer")}
            className="grid place-items-center tabular-nums"
          >
            {!locked && state.mode === "editing" ? (
              <div className="w-[512px] max-w-[100vw] aspect-video grid place-items-center touch-pinch-zoom">
                <DurationSelect
                  key={state.mode + state.initialDuration}
                  innerRef={durationSelect$}
                  defaultValue={state.initialDuration}
                />
              </div>
            ) : (
              <TimeViewer timerState$={timerState$} />
            )}
          </div>

          {locked ? (
            <div className="flex items-center justify-around">
              <CircleButton
                aria-controls={`${id("status")} ${id("timer")}`}
                disabled
                className="text-2xl"
              >
                {icon("lock-outline")}
              </CircleButton>

              <CircleButton
                aria-controls={`${id("status")} ${id("timer")}`}
                disabled
                className="text-2xl"
                color={state.mode === "running" ? "orange" : "green"}
              >
                {icon("lock-outline")}
              </CircleButton>
            </div>
          ) : (
            <div className="flex items-center justify-around">
              <CircleButton
                aria-controls={`${id("status")} ${id("timer")}`}
                disabled={state.mode === "editing"}
                className="text-xs"
                onClick={() => {
                  dispatch({
                    type: "cancel",
                  })
                }}
              >
                キャンセル
              </CircleButton>

              {state.mode === "editing" ? (
                <CircleButton
                  aria-controls={`${id("status")} ${id("timer")}`}
                  innerRef={primaryButton$}
                  color="green"
                  type="submit"
                >
                  開始
                </CircleButton>
              ) : state.mode === "running" ? (
                <CircleButton
                  aria-controls={`${id("status")} ${id("timer")}`}
                  innerRef={primaryButton$}
                  color="orange"
                  onClick={() => {
                    dispatch({
                      type: "pause",
                      at: serverTimestamp(),
                    })
                  }}
                >
                  一時停止
                </CircleButton>
              ) : (
                <CircleButton
                  aria-controls={`${id("status")} ${id("timer")}`}
                  innerRef={primaryButton$}
                  color="green"
                  onClick={() => {
                    if (pending) return

                    dispatch({
                      type: "resume",
                      at: serverTimestamp(),
                    })
                  }}
                >
                  再開
                </CircleButton>
              )}
            </div>
          )}
        </form>

        <ConfigArea
          className="flex items-center justify-evenly px-6"
          onInfoClick={() => {
            setHash(["info", roomId])
          }}
        />
      </div>
    </>
  )
}

function ConfigArea({
  className,
  onInfoClick,
}: {
  className?: string
  onInfoClick?(): void
}) {
  const config = useObservable(useConfig())
  const permission = useObservable(useMediaPermission(), "denied")

  const dialog$ = useRef<HTMLDialogElement>(null)
  const infoButton$ = useRef<HTMLButtonElement>(null)

  const isTutorialDone = getItem("tutorial") === "done"
  const doneTutorial = () => {
    dialog$.current?.close()
    setItem("tutorial", "done")
  }

  useShowDialogOnce(dialog$, isTutorialDone)
  usePlaceDialog(dialog$, infoButton$, isTutorialDone)

  const _id = useId()
  const id = (_: "flash" | "sound") => _id + _

  return (
    <div className={className}>
      <span id={id("flash")} role="status" className="sr-only">
        {config.flash === "on"
          ? "フラッシュはオンです"
          : "フラッシュはオフです"}
      </span>

      <TransparentButton
        aria-controls={id("flash")}
        title="フラッシュを切り替える"
        className="h-12 w-12 text-2xl"
        onClick={() => {
          toggleConfig("flash")
        }}
      >
        {config.flash === "on" ? icon("flash") : icon("flash-off")}
      </TransparentButton>

      <span id={id("sound")} role="status" className="sr-only">
        {config.sound === "on" && permission === "canplay"
          ? "音はオンです"
          : "音はオフです"}
      </span>

      <TransparentButton
        aria-controls={id("sound")}
        title="音を切り替える"
        className="h-12 w-12 text-2xl"
        onClick={() => {
          if (permission === "denied") return

          toggleConfig("sound")
        }}
      >
        {config.sound === "on" && permission === "canplay"
          ? icon("volume-high")
          : icon("volume-off")}
      </TransparentButton>

      <TransparentButton
        innerRef={infoButton$}
        title="情報を開く"
        className="h-12 w-12 text-2xl"
        onClick={onInfoClick}
      >
        {icon("information")}
      </TransparentButton>

      {!isTutorialDone && (
        <dialog
          ref={dialog$}
          className={clsx(
            "transition-[box-shadow,opacity,visibility] [&:not([open])]:opacity-0",
            "text-inherit bg-transparent overflow-visible rounded-sm",
            "open:shadow-screen open:shadow-dark/10 dark:open:shadow-light/20",
            // override default dialog style
            "fixed inset-0 p-0 m-0 max-w-full max-h-full backdrop:bg-transparent open:visible [&:not([open])]:invisible [&:not([open])]:block"
          )}
          onClick={doneTutorial}
        >
          <article
            className={clsx(
              "max-w-prose overscroll-contain rounded border px-6 py-4 pt-8",
              "text-dark/90 dark:text-light/90",
              "prose prose-headings:text-dark/70 prose-a:text-azure-700 dark:prose-headings:text-light/70 dark:prose-a:text-azure-300",
              "w-80 absolute right-0 bottom-0 translate-x-14 -translate-y-14",
              "border-gray-500 before:border-t-gray-500 bg-light after:border-t-light dark:bg-dark dark:after:border-t-dark",
              "before:border-8 before:left-3/4 before:bottom-0 before:translate-y-full before:-translate-x-1/2 before:content-[''] before:border-transparent before:absolute",
              "after:border-[6.5px] after:left-3/4 after:bottom-0 after:translate-y-full after:-translate-x-1/2 after:content-[''] after:border-transparent after:absolute"
            )}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <p>タイマーを共有したり新しくつくったりするには、ここをタップ！</p>

            <p className="text-right">
              <TransparentButton className="px-4 py-1" onClick={doneTutorial}>
                OK
              </TransparentButton>
            </p>
          </article>
        </dialog>
      )}
    </div>
  )
}

function useShowDialogOnce(
  dialog$: { current: HTMLDialogElement | null },
  disabled?: boolean
): void {
  useEffect(() => {
    if (disabled) return

    const dialog = dialog$.current
    if (!dialog || dialog.open || dialogUsed.has(dialog)) return

    dialog.showModal()
    dialogUsed.add(dialog)
  }, [dialog$, disabled])
}

function usePlaceDialog(
  dialog$: { current: HTMLDialogElement | null },
  target$: { current: HTMLElement | null },
  disabled?: boolean
): void {
  useEffect(() => {
    if (disabled) return

    const resize = new ResizeObserver(() => {
      const dialog = dialog$.current
      const target = target$.current
      if (!dialog || !target) return

      const { top, left, width, height } = target.getBoundingClientRect()

      dialog.style.top = `${top}px`
      dialog.style.left = `${left}px`
      dialog.style.width = `${width}px`
      dialog.style.height = `${height}px`
    })

    resize.observe(document.body)

    return () => {
      resize.disconnect()
    }
  }, [dialog$, disabled, target$])
}

const dialogUsed = new WeakSet<HTMLDialogElement>()
