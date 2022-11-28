import clsx from "clsx"
import icons from "./icon.json"

/**
 * @see https://materialdesignicons.com
 */
export function icon(
  name: keyof typeof icons,
  { className, ...props }: JSX.IntrinsicElements["svg"] = {}
) {
  return (
    <svg
      className={clsx(
        "inline-block h-[1em] w-[1em] align-[-0.15em]",
        className
      )}
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d={icons[name]} />
    </svg>
  )
}
