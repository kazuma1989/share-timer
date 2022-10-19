import { cx } from "@emotion/css"
import { Ref } from "react"

export function CircleButton({
  type = "button",
  className,
  color = "gray",
  innerRef,
  ...props
}: JSX.IntrinsicElements["button"] & {
  color?: "gray" | "green"
  ref?: "should use innerRef"
  innerRef?: Ref<HTMLButtonElement>
}) {
  let colorStyle: string
  switch (color) {
    case "gray": {
      colorStyle =
        "border-gray-600 bg-gray-700 text-gray-300 active:bg-gray-900 enabled:hover:bg-gray-800 disabled:text-gray-500"
      break
    }

    case "green": {
      colorStyle =
        "border-green-700 bg-green-900 text-green-300 hover:bg-green-900/75 active:bg-green-900/50"
      break
    }
  }

  return (
    <button
      {...props}
      ref={innerRef}
      type={type}
      className={cx(
        "h-20 w-20 cursor-pointer rounded-full border-4 border-double",
        colorStyle,
        className
      )}
    />
  )
}
