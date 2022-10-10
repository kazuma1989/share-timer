import { css, cx } from "@emotion/css"
import { Progress } from "./Progress"

export function FullViewportProgress({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        css`
          width: 100%;
          height: 90vh;
          display: grid;
          place-items: center;
        `,
        className
      )}
    >
      <Progress
        className={css`
          font-size: 25vmin;
          border-width: medium;
        `}
      />
    </div>
  )
}
