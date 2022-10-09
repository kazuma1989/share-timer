import { css } from "@emotion/css"
import { useReducer, useState } from "react"
import { formatDuration } from "./formatDuration"
import { parseTimeInput } from "./parseTimeInput"
import { useCollection } from "./useCollection"
import { useTimer } from "./useTimer"

export function App() {
  console.log(useCollection(["rooms"], (rawData) => rawData))

  const [state, dispatch] = useReducer(reducer, {
    mode: "paused",
    restDuration: 5 * 60_000,
  })

  const [timeInput, setTimeInput] = useState("")

  const now = useTimer(state.mode !== "running")

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()

        const duration = parseTimeInput(timeInput)
        if (duration === undefined) {
          alert(`invalid format ${timeInput}`)
          return
        }

        dispatch({
          type: "edit-done",
          duration,
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
            value={timeInput}
            size={5}
            className={css`
              width: 100%;
            `}
            onChange={(e) => {
              setTimeInput(e.currentTarget.value)
            }}
          />
        ) : state.mode === "running" ? (
          <span>
            {formatDuration(state.duration - (now - state.startedAt))}
          </span>
        ) : (
          <span>{formatDuration(state.restDuration)}</span>
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

            if (state.mode === "paused") {
              setTimeInput(formatDuration(state.restDuration))
            }
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
              at: Date.now(),
            })
          }}
        >
          Pause
        </button>
      ) : (
        <button
          type="button"
          disabled={state.mode === "editing"}
          onClick={() => {
            dispatch({
              type: "start",
              at: Date.now(),
            })
          }}
        >
          Start
        </button>
      )}
    </form>
  )
}

type TimerState =
  | {
      mode: "editing"
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

type TimerAction =
  | {
      type: "edit"
    }
  | {
      type: "edit-done"
      duration: number
    }
  | {
      type: "start"
      at: number
    }
  | {
      type: "pause"
      at: number
    }

function reducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case "edit": {
      return {
        mode: "editing",
      }
    }

    case "edit-done": {
      return {
        mode: "paused",
        restDuration: action.duration,
      }
    }

    case "start": {
      if (state.mode !== "paused") {
        return state
      }

      return {
        mode: "running",
        duration: state.restDuration,
        startedAt: action.at,
      }
    }

    case "pause": {
      if (state.mode !== "running") {
        return state
      }

      return {
        mode: "paused",
        restDuration: state.duration - (action.at - state.startedAt),
      }
    }

    // Do not use "default" here to be exhaustive for the all types.
  }
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("edit", () => {
    expect(
      reducer(
        {
          mode: "paused",
          restDuration: 5 * 60_000,
        },
        {
          type: "edit",
        }
      )
    ).toStrictEqual({
      mode: "editing",
    })
  })

  test("edit-done", () => {
    expect(
      reducer(
        {
          mode: "editing",
        },
        {
          type: "edit-done",
          duration: 5 * 60_000,
        }
      )
    ).toStrictEqual({
      mode: "paused",
      restDuration: 5 * 60_000,
    })
  })

  test("start", () => {
    const now = Date.now()

    expect(
      reducer(
        {
          mode: "paused",
          restDuration: 5 * 60_000,
        },
        {
          type: "start",
          at: now,
        }
      )
    ).toStrictEqual({
      mode: "running",
      duration: 5 * 60_000,
      startedAt: now,
    })
  })

  test("pause", () => {
    const now = Date.now()

    expect(
      reducer(
        {
          mode: "running",
          duration: 5 * 60_000,
          startedAt: now - 40_000,
        },
        {
          type: "pause",
          at: now,
        }
      )
    ).toStrictEqual({
      mode: "paused",
      restDuration: 5 * 60_000 - 40_000,
    })
  })
}
