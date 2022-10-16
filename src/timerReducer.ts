import { Action } from "./actionZod"
import { now } from "./now"
import { TimerState } from "./useTimerState"

export function timerReducer(state: TimerState, action: Action): TimerState {
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
      timerReducer(
        {
          mode: "paused",
          restDuration: 5 * 60000,
        },
        {
          type: "edit",
        }
      )
    ).toStrictEqual({
      mode: "editing",
      initialDuration: 5 * 60000,
    })
  })

  test("edit-done", () => {
    expect(
      timerReducer(
        {
          mode: "editing",
          initialDuration: 3 * 60000,
        },
        {
          type: "edit-done",
          duration: 5 * 60000,
        }
      )
    ).toStrictEqual({
      mode: "paused",
      restDuration: 5 * 60000,
    })
  })

  test("start", () => {
    const _now = now()

    expect(
      timerReducer(
        {
          mode: "paused",
          restDuration: 5 * 60000,
        },
        {
          type: "start",
          at: _now,
        }
      )
    ).toStrictEqual({
      mode: "running",
      duration: 5 * 60000,
      startedAt: _now,
    })
  })

  test("pause", () => {
    const _now = now()

    expect(
      timerReducer(
        {
          mode: "running",
          duration: 5 * 60000,
          startedAt: _now - 40000,
        },
        {
          type: "pause",
          at: _now,
        }
      )
    ).toStrictEqual({
      mode: "paused",
      restDuration: 5 * 60000 - 40000,
    })
  })

  test("multiple actions", () => {
    const _now = now()
    const actions: Action[] = [
      {
        type: "edit",
      },
      {
        type: "edit-done",
        duration: 7 * 60000,
      },
      {
        type: "start",
        at: _now,
      },
      {
        type: "pause",
        at: _now + 10000,
      },
      {
        type: "start",
        at: _now + 60000,
      },
      {
        type: "pause",
        at: _now + 80000,
      },
    ]

    const state = actions.reduce(timerReducer, {
      mode: "paused",
      restDuration: 5 * 60000,
    })

    expect(state).toStrictEqual({
      mode: "paused",
      restDuration: 6 * 60000 + 30000,
    })
  })
}
