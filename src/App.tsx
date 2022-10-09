import { css } from "@emotion/css"
import { useState, useSyncExternalStore } from "react"

type Mode = "editing" | "running" | "paused"

export function App() {
  const [mode, setMode] = useState<Mode>("paused")
  const [timeInput, setTimeInput] = useState("5:00")

  const now = useSyncExternalStore(tickTimer, () => Date.now())

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
        {mode === "editing" ? (
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
        ) : (
          <span>{timeInput}</span>
        )}
      </div>

      <div>{now}</div>

      {mode === "editing" ? (
        <button
          type="submit"
          onClick={() => {
            setMode("paused")
          }}
        >
          Done
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setMode("editing")
          }}
        >
          Edit
        </button>
      )}

      {mode === "running" ? (
        <button
          type="button"
          onClick={() => {
            setMode("paused")
          }}
        >
          Pause
        </button>
      ) : (
        <button
          type="button"
          disabled={mode === "editing"}
          onClick={() => {
            setMode("running")
          }}
        >
          Start
        </button>
      )}
    </form>
  )
}

function tickTimer(onStoreChange: () => void): () => void {
  const timer = setInterval(onStoreChange, 1_000)

  return () => {
    clearInterval(timer)
  }
}
