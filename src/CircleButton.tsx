import { cx } from "@emotion/css"
import { Ref } from "react"

export function CircleButton({
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
      className={cx(
        "h-20 w-20 cursor-pointer rounded-full border-4 border-double border-green-700 bg-green-900 text-green-300 hover:bg-green-900/75 active:bg-green-900/50",
        className
      )}
    />
  )
}
