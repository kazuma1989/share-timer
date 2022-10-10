import { css } from "@emotion/css"
import { query, serverTimestamp } from "firebase/firestore"
import { useRef } from "react"
import { collection } from "./collection"
import { createCollectionStore } from "./createCollectionStore"
import { formatDuration } from "./formatDuration"
import { orderBy } from "./orderBy"
import { parseTimeInput } from "./parseTimeInput"
import { Store } from "./Store"
import { timerAction, TimerAction, TimerActionOnFirestore } from "./timerAction"
import { TimeViewer } from "./TimeViewer"
import { useAddDoc } from "./useAddDoc"
import { useFirestore } from "./useFirestore"
import { useStore } from "./useStore"

type RoomId = string
const storeMap = new Map<RoomId, Store<TimerAction[]>>()

export function Timer({ roomId }: { roomId: RoomId }) {
  const db = useFirestore()

  let store = storeMap.get(roomId)
  if (!store) {
    store = createCollectionStore(
      query(
        collection(db, "rooms", roomId, "actions"),
        orderBy("createdAt", "asc")
      ),
      timerAction.parse
    )

    storeMap.set(roomId, store)
  }

  const actions = useStore(store)

  const state = actions.reduce(reducer, {
    mode: "paused",
    restDuration: 0,
  })

  const dispatch = useAddDoc<TimerActionOnFirestore>((db) =>
    collection(db, "rooms", roomId, "actions")
  )

  const timeInput$ = useRef<HTMLInputElement>(null)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()

        const timeInput = timeInput$.current?.value ?? ""

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
            ref={timeInput$}
            type="text"
            defaultValue={formatDuration(state.initialDuration)}
            size={5}
            className={css`
              && {
                height: unset;
                margin: 0;
                padding: 0;
              }
            `}
          />
        ) : state.mode === "running" ? (
          <TimeViewer duration={state.duration} startedAt={state.startedAt} />
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

function reducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case "edit": {
      if (state.mode !== "paused") {
        return state
      }

      return {
        mode: "editing",
        initialDuration: state.restDuration,
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
      initialDuration: 5 * 60_000,
    })
  })

  test("edit-done", () => {
    expect(
      reducer(
        {
          mode: "editing",
          initialDuration: 3 * 60_000,
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

  test("multiple actions", () => {
    const now = Date.now()
    const actions: TimerAction[] = [
      {
        type: "edit",
      },
      {
        type: "edit-done",
        duration: 7 * 60_000,
      },
      {
        type: "start",
        at: now,
      },
      {
        type: "pause",
        at: now + 10_000,
      },
      {
        type: "start",
        at: now + 60_000,
      },
      {
        type: "pause",
        at: now + 80_000,
      },
    ]

    const state = actions.reduce(reducer, {
      mode: "paused",
      restDuration: 5 * 60_000,
    })

    expect(state).toStrictEqual({
      mode: "paused",
      restDuration: 6 * 60_000 + 30_000,
    })
  })
}
