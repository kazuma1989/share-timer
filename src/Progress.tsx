import { css, cx } from "@emotion/css"

export function Progress({ className }: { className?: string }) {
  return (
    <progress
      className={cx(
        css`
          display: inline-block;
          inline-size: 1em;
          block-size: 1em;
          border-radius: 50%;
          border-style: solid;
          border-color: transparent;
          border-block-start-color: currentColor;
          animation: spin 1s infinite ease-out;

          &,
          &::-webkit-progress-bar,
          &::-webkit-progress-value {
            background-color: transparent;
          }
          &::-moz-progress-bar {
            background-color: transparent;
          }
          &::-ms-fill {
            background-color: transparent;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `,
        className
      )}
    />
  )
}
