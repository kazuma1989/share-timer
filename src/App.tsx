import { css } from "@emotion/css"
import { millisecondsToSeconds } from "date-fns"
import { useState } from "react"
import { useTimer } from "./useTimer"

type Mode =
  | { mode: "editing" }
  | { mode: "running"; startedAt: number }
  | { mode: "paused"; restDuration: number }

export function App() {
  const [_mode, setMode] = useState<Mode>({
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
        {_mode.mode === "editing" ? (
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
        ) : _mode.mode === "running" ? (
          <span>{millisecondsToSeconds(now - _mode.startedAt)}</span>
        ) : (
          <span>{formatDuration(_mode.restDuration)}</span>
        )}
      </div>

      <div>{now}</div>

      {_mode.mode === "editing" ? (
        <button
          type="submit"
          onClick={() => {
            const restDuration = parse(timeInput)
            if (restDuration === undefined) {
              alert(`invalid format ${timeInput}`)
              return
            }

            setMode({ mode: "paused", restDuration })
          }}
        >
          Done
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setMode({ mode: "editing" })
          }}
        >
          Edit
        </button>
      )}

      {_mode.mode === "running" ? (
        <button
          type="button"
          onClick={() => {
            setMode({
              mode: "paused",
              restDuration: Date.now() - _mode.startedAt,
            })
          }}
        >
          Pause
        </button>
      ) : (
        <button
          type="button"
          disabled={_mode.mode === "editing"}
          onClick={() => {
            setMode({ mode: "running", startedAt: Date.now() })
          }}
        >
          Start
        </button>
      )}
    </form>
  )
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
