import { css } from "@emotion/css"
import { serverTimestamp } from "firebase/firestore"
import { useRef } from "react"
import { formatDuration } from "./formatDuration"
import { Room } from "./roomZod"
import { timeInputZod } from "./timeInputZod"
import { timerReducer } from "./timerReducer"
import { TimeViewer } from "./TimeViewer"
import { useActions, useDispatchAction } from "./useActions"
import { useAllSettled } from "./useAllSettled"
import { useTitleAsTimeViewer } from "./useTitleAsTimeViewer"

export type TimerState =
  | {
      mode: "editing"
      initialDuration: number
    }
  | {
      mode: "running"
      startedAt: number
      duration: number
    }
  | {
      mode: "paused"
      restDuration: number
    }

export function Timer({ roomId }: { roomId: Room["id"] }) {
  const actions = useActions(roomId)
  const state = actions.reduce(timerReducer, {
    mode: "paused",
    restDuration: 0,
  })

  useTitleAsTimeViewer(state)

  const [_allSettled, addPromise] = useAllSettled()
  const pending = !_allSettled

  const _dispatch = useDispatchAction(roomId)
  const dispatch: typeof _dispatch = (action) => addPromise(_dispatch(action))

  const timeInput$ = useRef<HTMLInputElement>(null)

  return (
    <form
      onSubmit={(e) => {
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
      }}
    >
      <div
        className={css`
          font-size: 30vmin;
        `}
      >
        {state.mode === "editing" ? (
          <input
            ref={timeInput$}
            type="text"
            defaultValue={formatDuration(state.initialDuration)}
            size={5}
            className={css`
              && {
                height: unset;
                margin: unset;
                padding: 0.05em;
                line-height: 1;
              }
            `}
          />
        ) : (
          <div
            className={css`
              padding: 0.05em;
              line-height: 1.18;
              border: 1px solid transparent;
            `}
          >
            {state.mode === "running" ? (
              <TimeViewer
                duration={state.duration}
                startedAt={state.startedAt}
              />
            ) : (
              <span>{formatDuration(state.restDuration)}</span>
            )}
          </div>
        )}
      </div>

      {state.mode === "editing" ? (
        <button key="done" type="submit">
          Done
        </button>
      ) : (
        <button
          key="edit"
          type="button"
          disabled={state.mode !== "paused"}
          onClick={() => {
            dispatch({
              type: "edit",
            })
          }}
        >
          Edit
        </button>
      )}

      {state.mode === "running" ? (
        <button
          type="button"
          onClick={() => {
            dispatch({
              type: "pause",
              at: serverTimestamp(),
            })
          }}
        >
          Pause
        </button>
      ) : (
        <button
          type="button"
          disabled={pending || state.mode === "editing"}
          onClick={() => {
            dispatch({
              type: "start",
              at: serverTimestamp(),
            })
          }}
        >
          Start
        </button>
      )}
    </form>
  )
}
