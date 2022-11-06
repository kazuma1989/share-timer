import clsx from "clsx"
import { useError } from "./ErrorBoundary"
import { icon } from "./icon"

export function FullViewportOops({ className }: { className?: string }) {
  const error = useError()

  return (
    <div className={clsx("grid h-screen place-items-center", className)}>
      <div className="max-w-full overflow-auto">
        <h1 className="mb-8 text-center text-8xl sm:text-9xl">
          {icon("emoticon-dead-outline", { role: "img", "aria-label": "o" })}
          ops!
        </h1>

        <div className="max-w-full overflow-auto px-2 text-cerise-500">
          <pre className="text-xs">
            {error instanceof Error
              ? error.stack || error.message
              : String(error)}
          </pre>
        </div>
      </div>
    </div>
  )
}
