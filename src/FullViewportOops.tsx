import clsx from "clsx"

export function FullViewportOops({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "grid h-screen place-items-center text-8xl sm:text-9xl",
        className
      )}
    >
      Oops!
    </div>
  )
}
