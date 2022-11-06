import clsx from "clsx"
import { useError } from "./ErrorBoundary"

export function FullViewportOops({ className }: { className?: string }) {
  const error = useError()

  return (
    <div className={clsx("grid h-screen place-items-center", className)}>
      <div className="max-w-full overflow-auto">
        <h1 className="mb-8 text-center text-8xl sm:text-9xl">
          <svg
            role="img"
            aria-label="o"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="inline-block h-[1em] w-[1em] align-bottom"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
            />
          </svg>
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
