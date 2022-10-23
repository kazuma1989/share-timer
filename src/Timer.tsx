import clsx from "clsx"
import { serverTimestamp } from "firebase/firestore"
import { useRef } from "react"
import { CheckAudioButton } from "./CheckAudioButton"
import { CircleButton } from "./CircleButton"
import { DurationSelect } from "./DurationSelect"
import { TimeViewer } from "./TimeViewer"
import { useAlertSound } from "./useAlertSound"
import { useAllSettled } from "./useAllSettled"
import { useDispatchAction } from "./useDispatchAction"
import { useObservable } from "./useObservable"
import { useTimerState } from "./useTimerState"
import { formatDuration } from "./util/formatDuration"
import { Room } from "./zod/roomZod"

export function Timer({
  roomId,
  className,
}: {
  roomId: Room["id"]
  className?: string
}) {
  const state = useObservable(useTimerState())

  useAlertSound(state)

  const [_allSettled, addPromise] = useAllSettled()
  const pending = !_allSettled

  const _dispatch = useDispatchAction(roomId)
  const dispatch: typeof _dispatch = (action) => addPromise(_dispatch(action))

  const durationSelect$ = useRef({
    value: state.initialDuration,
  })
  const primaryButton$ = useRef<HTMLButtonElement>(null)

  return (
    <form
      className={clsx("grid grid-rows-[1fr_auto_1fr]", className)}
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
      <div className="relative top-5 grid min-h-fit place-items-center tabular-nums">
        {state.mode === "editing" ? (
          <DurationSelect
            key={state.mode + state.initialDuration}
            innerRef={durationSelect$}
            defaultValue={state.initialDuration}
          />
        ) : (
          <div className="text-8xl font-thin sm:text-9xl">
            {state.mode === "running" ? (
              <TimeViewer
                duration={state.restDuration}
                startedAt={state.startedAt}
              >
                {(restDuration) => (
                  <span>{formatDuration(restDuration ?? 0)}</span>
                )}
              </TimeViewer>
            ) : (
              <span>{formatDuration(state.restDuration)}</span>
            )}
          </div>
        )}
      </div>

      <div className="relative top-10 flex items-center justify-around">
        <CircleButton
          disabled={state.mode === "editing"}
          className="text-xs"
          onClick={async () => {
            await dispatch({
              type: "cancel",
            })

            // FIXME 編集にすぐ移りたい
            // duration$.current!.focus()
          }}
        >
          キャンセル
        </CircleButton>

        {state.mode === "editing" ? (
          <CircleButton innerRef={primaryButton$} color="green" type="submit">
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

      {import.meta.env.DEV && (
        <div className="grid place-items-center">
          <CheckAudioButton />
        </div>
      )}
    </form>
  )
}
