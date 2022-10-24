import clsx from "clsx"
import { Progress } from "./Progress"

export function FullViewportProgress({ className }: { className?: string }) {
  return (
    <div className={clsx("grid h-screen place-items-center", className)}>
      <Progress className="h-60 w-60 border-[medium]" />
    </div>
  )
}
