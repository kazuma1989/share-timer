import clsx from "clsx"
import { serverTimestamp } from "firebase/firestore"
import { useRef } from "react"
import { Observable } from "rxjs"
import { CircleButton } from "./CircleButton"
import { DurationSelect } from "./DurationSelect"
import { icon } from "./icon"
import { setHash } from "./observeHash"
import { getItem } from "./storage"
import { TimerState } from "./timerReducer"
import { TimeViewer } from "./TimeViewer"
import { TransparentButton } from "./TransparentButton"
import { useMediaPermission } from "./useAudio"
import { toggleConfig, useConfig } from "./useConfig"
import { useDispatch } from "./useDispatch"
import { useObservable } from "./useObservable"
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

  return (
    <>
      <div className={clsx("grid grid-rows-[auto_5fr_auto_4fr]", className)}>
        <div className="pt-2 text-center">
          <h1>{roomName}</h1>
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
          <div className="grid place-items-center tabular-nums">
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
              <CircleButton disabled className="text-2xl">
                {icon("lock-outline")}
              </CircleButton>

              <CircleButton
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
                  innerRef={primaryButton$}
                  color="green"
                  type="submit"
                >
                  開始
                </CircleButton>
              ) : state.mode === "running" ? (
                <CircleButton
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

  const dialog$ = useRef<HTMLDialogElement | null>(null)
  const infoButton$ = useRef<HTMLButtonElement>(null)

  return (
    <div className={className}>
      <TransparentButton
        title="フラッシュを切り替える"
        className="h-12 w-12 text-2xl"
        onClick={() => {
          toggleConfig("flash")
        }}
      >
        {config.flash === "on" ? icon("flash") : icon("flash-off")}
      </TransparentButton>

      <TransparentButton
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

      <dialog
        className={clsx(
          "transition-[opacity,visibility] [&:not([open])]:opacity-0",
          "text-inherit bg-transparent overflow-visible",
          "open:shadow-screen open:shadow-dark/10 dark:open:shadow-light/20",
          // override default dialog style
          "fixed inset-0 p-0 m-0 max-w-full max-h-full backdrop:bg-transparent open:visible [&:not([open])]:invisible [&:not([open])]:block"
        )}
        ref={(dialog) => {
          dialog$.current = dialog

          if (!dialog || dialog.open || dialog.dataset.used === "true") return

          dialog.dataset.used = "true"
          dialog.showModal()

          const inner = dialog.firstElementChild
          const infoButton = infoButton$.current
          if (!(inner instanceof HTMLElement) || !infoButton) return

          const { top, left, width, height } =
            infoButton.getBoundingClientRect()

          dialog.style.top = `${top}px`
          dialog.style.left = `${left}px`
          dialog.style.width = `${width}px`
          dialog.style.height = `${height}px`

          inner.style.transform = "translate(-50%, -100%)"
        }}
        onClick={() => {
          dialog$.current?.close()
        }}
      >
        <article
          className={clsx(
            "max-w-prose overscroll-contain rounded border",
            "border-gray-500 bg-light dark:bg-dark",
            "p-8 absolute",
            "before:border-8 before:border-t-gray-500 before:left-3/4 before:bottom-0 before:translate-y-full before:-translate-x-1/2 before:content-[''] before:border-transparent before:absolute",
            "after:border-[6.5px] after:border-t-light after:dark:border-t-dark after:left-3/4 after:bottom-0 after:translate-y-full after:-translate-x-1/2 after:content-[''] after:border-transparent after:absolute"
          )}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          hello
          <TransparentButton
            className="w-full border border-gray-500 block px-4 py-3"
            onClick={() => {
              dialog$.current?.close()
            }}
          >
            OK!
          </TransparentButton>
        </article>
      </dialog>
    </div>
  )
}
