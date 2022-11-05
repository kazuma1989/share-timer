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
        "border-gray-500 bg-gray-100 text-gray-700",
        "hover:border-gray-600 hover:bg-gray-200 hover:text-gray-800",
        "active:bg-gray-300",
        "disabled:bg-gray-50",

        "dark:border-gray-500 dark:bg-gray-900 dark:text-gray-300",
        "dark:hover:border-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200",
        "dark:active:border-gray-300 dark:active:bg-gray-800",
        "dark:disabled:bg-gray-900"
      )
      break
    }

    case "green": {
      colorStyle = clsx(
        "border-green-500 bg-green-100 text-green-700",
        "hover:border-green-600 hover:bg-green-200 hover:text-green-800",
        "active:bg-green-300",
        "disabled:bg-green-50",

        "dark:border-green-500 dark:bg-green-900 dark:text-green-300",
        "dark:hover:border-green-400 dark:hover:bg-green-800 dark:hover:text-green-200",
        "dark:active:border-green-300 dark:active:bg-green-800",
        "dark:disabled:bg-green-900"
      )
      break
    }

    case "orange": {
      colorStyle = clsx(
        "border-orange-500 bg-orange-100 text-orange-700",
        "hover:border-orange-600 hover:bg-orange-200 hover:text-orange-800",
        "active:bg-orange-300",
        "disabled:bg-orange-50",

        "dark:border-orange-500 dark:bg-orange-900 dark:text-orange-300",
        "dark:hover:border-orange-400 dark:hover:bg-orange-800 dark:hover:text-orange-200",
        "dark:active:border-orange-300 dark:active:bg-orange-800",
        "dark:disabled:bg-orange-900"
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
        "disabled:cursor-auto disabled:border-neutral-400 disabled:text-neutral-700",
        "dark:disabled:cursor-auto dark:disabled:border-neutral-700 dark:disabled:text-neutral-400",
        className
      )}
    />
  )
}
