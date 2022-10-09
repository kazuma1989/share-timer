import { css } from "@emotion/css"
import { millisecondsToSeconds } from "date-fns"
import { useReducer, useState } from "react"
import { useTimer } from "./useTimer"

export function App() {
  const [state, dispatch] = useReducer(reducer, {
    mode: "paused",
    restDuration: 5 * 60_000,
  })

  const [timeInput, setTimeInput] = useState("5:00")

  const now = useTimer()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
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
          <span>{millisecondsToSeconds(now - state.startedAt)}</span>
        ) : (
          <span>{formatDuration(state.restDuration)}</span>
        )}
      </div>

      <div>{now}</div>

      {state.mode === "editing" ? (
        <button
          type="submit"
          onClick={() => {
            const duration = parse(timeInput)
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
          Done
        </button>
      ) : (
        <button
          type="button"
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

function parse(timeInput: string): number | undefined {
  const [, minutesPart, secondsPart] =
    timeInput.match(/^(?:\s*(\d+)\s*:)?\s*(\d+)\s*$/) ?? []

  // Invalid format
  if (secondsPart === undefined) {
    return undefined
  }

  const minutes = minutesPart === undefined ? 0 : parseInt(minutesPart)
  const seconds = parseInt(secondsPart)
  // Need NaN check?

  return minutes * 60_000 + seconds * 1_000
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("basic", () => {
    expect(parse("5:00")).toBe(5 * 60_000)
  })

  test("white spaces", () => {
    expect(parse(" 3    :  01   ")).toBe(3 * 60_000 + 1_000)
  })

  test("invalid format", () => {
    expect(parse("x:00")).toBeUndefined()
  })
}

function formatDuration(durationMs: number): string {
  // durationMs = 321_456

  // milliseconds = 456
  const milliseconds = durationMs % 1_000

  // durationSec = 321
  const durationSec = (durationMs - milliseconds) / 1_000

  // seconds = 21
  const seconds = durationSec % 60

  // minutes = 3
  const minutes = (durationSec - seconds) / 60

  return [minutes.toString(), seconds.toString().padStart(2, "0")].join(":")
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("basic", () => {
    expect(formatDuration(5 * 60_000)).toBe("5:00")
  })

  test("omit milliseconds unit", () => {
    expect(formatDuration(3 * 60_000 + 1_000 + 789)).toBe("3:01")
  })
}
