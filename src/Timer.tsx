import { css } from "@emotion/css"
import {
  addDoc,
  doc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { useEffect, useRef } from "react"
import { Action, ActionOnFirestore } from "./actionZod"
import { collection } from "./collection"
import { formatDuration } from "./formatDuration"
import { Room, RoomOnFirestore } from "./roomZod"
import { now, subscribeTimer } from "./subscribeTimer"
import { timeInputZod } from "./timeInputZod"
import { TimeViewer } from "./TimeViewer"
import { useActions } from "./useActions"
import { useAllSettled } from "./useAllSettled"
import { useFirestore } from "./useFirestore"
import { withMeta } from "./withMeta"

export function Timer({ roomId }: { roomId: Room["id"] }) {
  const db = useFirestore()

  const actions = useActions(roomId)
  const state = actions.reduce(reducer, {
    mode: "paused",
    restDuration: 0,
  })

  useTitle(state)

  const [_allSettled, addPromise] = useAllSettled()
  const pending = !_allSettled

  const dispatch = (action: ActionOnFirestore) => {
    if (pending) return

    if (action.type === "edit-done") {
      return addPromise(
        runTransaction(
          db,
          async (transaction) => {
            const room = doc(collection(db, "rooms"), roomId)

            const getOptimisticLock = () => transaction.get(room)
            await getOptimisticLock()

            const roomUpdate: Partial<RoomOnFirestore> = {
              lastEditAt: serverTimestamp() as Timestamp,
            }
            transaction.update(room, roomUpdate)

            const actions = collection(db, "rooms", roomId, "actions")
            const newActionId = doc(actions).id
            transaction.set(doc(actions, newActionId), withMeta(action))
          },
          {
            maxAttempts: 1,
          }
        )
      )
    }

    return addPromise(
      addDoc(collection(db, "rooms", roomId, "actions"), withMeta(action))
    )
  }

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
            disabled={pending}
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
        <button key="done" type="submit" disabled={pending}>
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
              at: serverTimestamp() as Timestamp,
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
              at: serverTimestamp() as Timestamp,
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

function reducer(state: TimerState, action: Action): TimerState {
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

function useTitle(state: TimerState) {
  let restDuration = NaN
  let duration = NaN
  let startedAt = NaN
  switch (state.mode) {
    case "paused": {
      restDuration = state.restDuration
      break
    }

    case "running": {
      duration = state.duration
      startedAt = state.startedAt
      break
    }

    case "editing": {
      break
    }
  }

  const mode = state.mode
  useEffect(() => {
    switch (mode) {
      case "paused": {
        document.title = formatDuration(restDuration)
        return
      }

      case "running": {
        let previous: number
        return subscribeTimer(() => {
          const d = now() - startedAt
          const delta = d - (d % 1_000)

          const current = duration - delta > 0 ? duration - delta : 0
          if (current !== previous) {
            document.title = formatDuration(current)
            previous = current
          }
        })
      }

      case "editing": {
        document.title = "share-timer"
        return
      }
    }
  }, [duration, mode, restDuration, startedAt])
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
    const actions: Action[] = [
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
