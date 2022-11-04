import clsx from "clsx"
import { Ref } from "react"

export function CircleButton({
  type = "button",
  className,
  color = "gray",
  innerRef,
  ...props
}: JSX.IntrinsicElements["button"] & {
  color?: "gray" | "green" | "orange"
  ref?: "should use innerRef"
  innerRef?: Ref<HTMLButtonElement>
}) {
  let colorStyle: string
  switch (color) {
    case "gray": {
      colorStyle = clsx(
        "border-gray-500 bg-gray-900 text-gray-300",
        "hover:border-gray-400 hover:bg-gray-800 hover:text-gray-200",
        "active:border-gray-300",
        "disabled:bg-gray-900"
      )
      break
    }

    case "green": {
      colorStyle = clsx(
        "border-green-500 bg-green-900 text-green-300",
        "hover:border-green-400 hover:bg-green-800 hover:text-green-200",
        "active:border-green-300",
        "disabled:bg-green-900"
      )
      break
    }

    case "orange": {
      colorStyle = clsx(
        "border-orange-500 bg-orange-900 text-orange-300",
        "hover:border-orange-400 hover:bg-orange-800 hover:text-orange-200",
        "active:border-orange-300",
        "disabled:bg-orange-900"
      )
      break
    }
  }

  return (
    <button
      {...props}
      ref={innerRef}
      type={type}
      className={clsx(
        "h-20 w-20 cursor-pointer select-none rounded-full border-4 border-double",
        colorStyle,
        "disabled:cursor-auto disabled:border-neutral-700 disabled:text-neutral-400",
        className
      )}
    />
  )
}
