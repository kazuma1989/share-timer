import clsx from "clsx"

export function Progress({ className }: { className?: string }) {
  return (
    <progress
      className={clsx(
        "progress-bar-transparent inline-block h-[1em] w-[1em] animate-[spin_1s_ease-out_infinite] rounded-full border border-solid border-transparent border-t-current bg-transparent",
        className
      )}
    />
  )
}
