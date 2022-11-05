import clsx from "clsx"

export function Progress({ className }: { className?: string }) {
  return (
    <progress
      className={clsx(
        "progress-bar-transparent inline-block min-h-[1rem] min-w-[1rem] animate-spin rounded-full border border-solid border-transparent border-t-current bg-transparent",
        className
      )}
    />
  )
}
