import clsx from "clsx"
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
  const pauseOrResumeButton$ = useRef<HTMLButtonElement>(null)

  return (
    <form
      className={clsx("grid grid-rows-[1fr_auto_1fr]", className)}
      onSubmit={async (e) => {
        e.preventDefault()

        const timeInput = timeInput$.current?.value ?? ""

        const parsed = timeInputZod.safeParse(timeInput)
        if (!parsed.success) {
          alert(`invalid format ${timeInput}`)
          return
        }

        dispatch({
          type: "start",
          withDuration: parsed.data,
          at: serverTimestamp(),
        })

        await new Promise((resolve) => globalThis.setTimeout(resolve, 100))
        pauseOrResumeButton$.current?.focus()
      }}
    >
      <div className="grid min-h-[12rem] place-items-center text-8xl font-thin tabular-nums text-white sm:text-9xl">
        {state.mode === "editing" ? (
          <input
            ref={timeInput$}
            type="text"
            defaultValue={formatDuration(state.initialDuration)}
            size={6}
            className="rounded-lg border border-white bg-transparent py-2 text-center"
          />
        ) : (
          <div>
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

      <div className="flex items-center justify-around">
        <CircleButton
          disabled={state.mode === "editing"}
          className="text-xs"
          onClick={async () => {
            await dispatch({
              type: "cancel",
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
            innerRef={pauseOrResumeButton$}
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
            innerRef={pauseOrResumeButton$}
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
    </form>
  )
}
