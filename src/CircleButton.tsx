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
      // FIXME grayのhover, activeの変化をgreen, orangeと同じくらいに揃えておきたい
      colorStyle = clsx(
        "border-gray-600 bg-gray-700 text-gray-300 active:bg-gray-900 enabled:hover:bg-gray-800 disabled:text-gray-500"
      )

      break
    }

    case "green": {
      // FIXME add disabled style
      colorStyle = clsx(
        "border-green-700 bg-green-900/60 text-green-300 hover:bg-green-900/50 active:bg-green-900/30"
      )
      break
    }

    case "orange": {
      // FIXME add disabled style
      colorStyle = clsx(
        "border-orange-700 bg-orange-900/60 text-orange-300 hover:bg-orange-900/50 active:bg-orange-900/30"
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
        "h-20 w-20 cursor-pointer rounded-full border-4 border-double",
        colorStyle,
        className
      )}
    />
  )
}
