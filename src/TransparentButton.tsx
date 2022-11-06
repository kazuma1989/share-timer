import clsx from "clsx"
import { Ref } from "react"

export function TransparentButton({
  type = "button",
  className,
  innerRef,
  ...props
}: JSX.IntrinsicElements["button"] & {
  ref?: "should use innerRef"
  innerRef?: Ref<HTMLButtonElement>
}) {
  return (
    <button
      {...props}
      ref={innerRef}
      type={type}
      className={clsx(
        "cursor-pointer rounded-md transition-colors",
        "hover:bg-dark/10 active:bg-dark/20 dark:hover:bg-light/25 dark:active:bg-light/30",
        // "disabled:cursor-auto disabled:border-neutral-400 disabled:text-neutral-700",
        // "dark:disabled:cursor-auto dark:disabled:border-neutral-700 dark:disabled:text-neutral-400",
        className
      )}
    />
  )
}
