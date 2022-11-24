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
              <div className="w-[512px] max-w-[100vw] aspect-video grid place-items-center">
                <DurationSelect
                  key={state.mode + state.initialDuration}
                  innerRef={durationSelect$}
                  defaultValue={state.initialDuration}
                />
              </div>
            ) : (
              <TimeViewer
                timerState$={timerState$}
                scale={window.devicePixelRatio}
              />
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
        title="情報を開く"
        className="h-12 w-12 text-2xl"
        onClick={onInfoClick}
      >
        {icon("information")}
      </TransparentButton>
    </div>
  )
}
