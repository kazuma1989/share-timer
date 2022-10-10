import { css } from "@emotion/css"
import {
  collection,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { useState } from "react"
import { z } from "zod"
import { formatDuration } from "./formatDuration"
import { parseTimeInput } from "./parseTimeInput"
import { useAddDoc } from "./useAddDoc"
import { useCollection } from "./useCollection"
import { useTimer } from "./useTimer"

export function App() {
  // TODO take id from URL
  const roomId = "OfzJLddWnrLkPZOJN34A"

  const actions = useCollection(
    (db) =>
      query(
        collection(db, "rooms", roomId, "actions"),
        orderBy("createdAt", "asc")
      ),
    (rawData) => timerAction.parse(rawData)
  )

  const state = actions.reduce(reducer, {
    mode: "paused",
    restDuration: 5 * 60_000,
  })

  const dispatch = useAddDoc<z.input<typeof timerAction>>((db) =>
    collection(db, "rooms", roomId, "actions")
  )

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
            type="text"
            value={timeInput}
            size={5}
            className={css`
              && {
                height: unset;
                margin: 0;
                padding: 0;
              }
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
              at: serverTimestamp(),
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

const timerAction = z.union([
  z.object({
    type: z.literal("edit"),
  }),

  z.object({
    type: z.literal("edit-done"),
    duration: z.number(),
  }),

  z.object({
    type: z.literal("start"),
    at: z.instanceof(Timestamp).transform((t) => t.toMillis()),
  }),

  z.object({
    type: z.literal("pause"),
    at: z.instanceof(Timestamp).transform((t) => t.toMillis()),
  }),
])

type TimerAction = z.output<typeof timerAction>

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
