import { css } from "@emotion/css"

const COLOR = "blue"

export function App() {
  return (
    <div
      className={css`
        color: ${COLOR};
      `}
    >
      <h1>Hello</h1>
    </div>
  )
}
