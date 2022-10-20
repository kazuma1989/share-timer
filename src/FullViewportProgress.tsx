import clsx from "clsx"
import { Progress } from "./Progress"

export function FullViewportProgress({ className }: { className?: string }) {
  return (
    <div className={clsx("grid h-screen place-items-center", className)}>
      <Progress className="border-2 text-[25vw]" />
    </div>
  )
}
