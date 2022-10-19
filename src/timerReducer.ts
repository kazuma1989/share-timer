import { TimerState } from "./useTimerState"
import { Action } from "./zod/actionZod"

export function timerReducer(state: TimerState, action: Action): TimerState {
  switch (action.type) {
    case "start": {
      if (state.mode === "running") {
        return state
      }

      return {
        mode: "running",
        initialDuration: action.withDuration,
        restDuration: action.withDuration,
        startedAt: action.at,
      }
    }

    case "pause": {
      if (state.mode !== "running") {
        return state
      }

      return {
        mode: "paused",
        initialDuration: state.initialDuration,
        restDuration: state.restDuration - (action.at - state.startedAt),
      }
    }

    case "resume": {
      if (state.mode !== "paused") {
        return state
      }

      return {
        mode: "running",
        initialDuration: state.initialDuration,
        restDuration: state.restDuration,
        startedAt: action.at,
      }
    }

    case "cancel": {
      return {
        mode: "editing",
        initialDuration: state.initialDuration,
      }
    }

    // Do not use "default" here to be exhaustive for the all types.
  }
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  // eslint-disable-next-line no-restricted-globals
  const _now = Date.now()

  test("set initial state", () => {
    const durationSetByUser = Math.floor(Math.random() * 10 * 60_000)
    const actions: Action[] = [
      {
        type: "start",
        withDuration: durationSetByUser,
        at: _now,
      },
      {
        type: "cancel",
      },
    ]

    const state = actions.reduce(timerReducer, {
      mode: "editing",
      initialDuration: 0,
    })

    expect(state).toStrictEqual<typeof state>({
      mode: "editing",
      initialDuration: durationSetByUser,
    })
  })

  test("start", () => {
    const state = timerReducer(
      {
        mode: "editing",
        initialDuration: 3 * 60_000,
      },
      {
        type: "start",
        withDuration: 5 * 60_000,
        at: _now,
      }
    )

    expect(state).toStrictEqual<typeof state>({
      mode: "running",
      initialDuration: 5 * 60_000,
      restDuration: 5 * 60_000,
      startedAt: _now,
    })
  })

  test("pause", () => {
    const state = timerReducer(
      {
        mode: "running",
        initialDuration: 5 * 60_000,
        restDuration: 4 * 60_000,
        startedAt: _now - 40_000,
      },
      {
        type: "pause",
        at: _now,
      }
    )

    expect(state).toStrictEqual<typeof state>({
      mode: "paused",
      initialDuration: 5 * 60_000,
      restDuration: 4 * 60_000 - 40_000,
    })
  })

  test("resume", () => {
    const state = timerReducer(
      {
        mode: "paused",
        initialDuration: 5 * 60_000,
        restDuration: 4 * 60_000,
      },
      {
        type: "resume",
        at: _now,
      }
    )

    expect(state).toStrictEqual<typeof state>({
      mode: "running",
      initialDuration: 5 * 60_000,
      restDuration: 4 * 60_000,
      startedAt: _now,
    })
  })

  test("cancel", () => {
    const state = timerReducer(
      {
        mode: "paused",
        initialDuration: 5 * 60_000,
        restDuration: 4 * 60_000,
      },
      {
        type: "cancel",
      }
    )

    expect(state).toStrictEqual<typeof state>({
      mode: "editing",
      initialDuration: 5 * 60_000,
    })
  })

  test("multiple actions", () => {
    const actions: Action[] = [
      {
        type: "start",
        withDuration: 7 * 60_000,
        at: _now,
      },
      {
        type: "pause",
        at: _now + 10_000,
      },
      {
        type: "resume",
        at: _now + 60_000,
      },
      {
        type: "pause",
        at: _now + 80_000,
      },
    ]

    const state = actions.reduce(timerReducer, {
      mode: "editing",
      initialDuration: 3 * 60_000,
    })

    expect(state).toStrictEqual<typeof state>({
      mode: "paused",
      initialDuration: 7 * 60_000,
      restDuration: 6 * 60_000 + 30_000,
    })
  })
}
