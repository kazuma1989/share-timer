import { cx } from "@emotion/css"
import { serverTimestamp } from "firebase/firestore"
import { useRef } from "react"
import { CircleButton } from "./CircleButton"
import { formatDuration } from "./formatDuration"
import { TimeViewer } from "./TimeViewer"
import { useAllSettled } from "./useAllSettled"
import { useDispatchAction } from "./useDispatchAction"
import { useTimerState } from "./useTimerState"
import { useTitleAsTimeViewer } from "./useTitleAsTimeViewer"
import { Room } from "./zod/roomZod"
import { timeInputZod } from "./zod/timeInputZod"

export function Timer({
  roomId,
  className,
}: {
  roomId: Room["id"]
  className?: string
}) {
  const state = useTimerState(roomId)

  useTitleAsTimeViewer(state)

  const [_allSettled, addPromise] = useAllSettled()
  const pending = !_allSettled

  const _dispatch = useDispatchAction(roomId)
  const dispatch: typeof _dispatch = (action) => addPromise(_dispatch(action))

  const timeInput$ = useRef<HTMLInputElement>(null)
  const resumeButton$ = useRef<HTMLButtonElement>(null)

  return (
    <form
      className={cx("grid grid-rows-[1fr_auto_1fr]", className)}
      onSubmit={async (e) => {
        e.preventDefault()

        const timeInput = timeInput$.current?.value ?? ""

        const parsed = timeInputZod.safeParse(timeInput)
        if (!parsed.success) {
          alert(`invalid format ${timeInput}`)
          return
        }

        dispatch({
          type: "edit-done",
          duration: parsed.data,
        })

        await new Promise((resolve) => globalThis.setTimeout(resolve, 100))
        resumeButton$.current?.focus()
      }}
    >
      <div className="grid place-items-center text-8xl text-white sm:text-9xl">
        {state.mode === "editing" ? (
          <input
            ref={timeInput$}
            type="text"
            defaultValue={formatDuration(state.initialDuration)}
            size={5}
            className="border border-white bg-transparent py-2 text-center"
          />
        ) : (
          <div>
            {state.mode === "running" ? (
              <TimeViewer duration={state.duration} startedAt={state.startedAt}>
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

      <div className="flex items-center justify-around">
        <CircleButton
          disabled={state.mode !== "paused"}
          className="text-xs"
          onClick={async () => {
            await dispatch({
              type: "edit",
            })

            timeInput$.current!.focus()
          }}
        >
          キャンセル
        </CircleButton>

        {state.mode === "editing" ? (
          <CircleButton color="green" type="submit">
            開始
          </CircleButton>
        ) : state.mode === "running" ? (
          <CircleButton
            // TODO orange color
            color="green"
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
            color="green"
            innerRef={resumeButton$}
            disabled={pending}
            onClick={() => {
              dispatch({
                type: "start",
                at: serverTimestamp(),
              })
            }}
          >
            再開
          </CircleButton>
        )}
      </div>
    </form>
  )
}
