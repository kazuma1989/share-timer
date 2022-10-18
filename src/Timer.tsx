import { cx } from "@emotion/css"
import { serverTimestamp } from "firebase/firestore"
import { useRef } from "react"
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
            className="bg-transparent py-2 text-center"
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
        <button
          type="button"
          disabled={state.mode !== "paused"}
          // TODO disabled design
          className="h-20 w-20 cursor-pointer rounded-full border-4 border-double border-gray-600 bg-gray-700 text-xs text-gray-300 hover:bg-gray-800 active:bg-gray-900"
          onClick={async () => {
            await dispatch({
              type: "edit",
            })

            timeInput$.current!.focus()
          }}
        >
          キャンセル
        </button>

        {state.mode === "editing" ? (
          <button
            type="submit"
            className="h-20 w-20 cursor-pointer rounded-full border-4 border-double border-green-700 bg-green-900 text-green-300 hover:bg-green-900/75 active:bg-green-900/50"
          >
            開始
          </button>
        ) : state.mode === "running" ? (
          <button
            type="button"
            // TODO orange color
            className="h-20 w-20 cursor-pointer rounded-full border-4 border-double border-green-700 bg-green-900 text-green-300 hover:bg-green-900/75 active:bg-green-900/50"
            onClick={() => {
              dispatch({
                type: "pause",
                at: serverTimestamp(),
              })
            }}
          >
            一時停止
          </button>
        ) : (
          <button
            ref={resumeButton$}
            type="button"
            disabled={pending}
            className="h-20 w-20 cursor-pointer rounded-full border-4 border-double border-green-700 bg-green-900 text-green-300 hover:bg-green-900/75 active:bg-green-900/50"
            onClick={() => {
              dispatch({
                type: "start",
                at: serverTimestamp(),
              })
            }}
          >
            再開
          </button>
        )}
      </div>
    </form>
  )
}
