import clsx from "clsx"
import { useEffect, useState } from "react"
import { skipWhile, take, takeWhile } from "rxjs"
import { useCurrentDurationUI } from "./useCurrentDuration"
import { useTimerState } from "./useTimerState"
import { useObservable } from "./util/createStore"

export function FlashCover({ className }: { className?: string }) {
  const { mode } = useObservable(useTimerState())

  const state = mode === "editing" ? "asleep" : "awake"

  return <FlashCoverInner key={state} className={className} />
}

function FlashCoverInner({ className }: { className?: string }) {
  const duration$ = useCurrentDurationUI()

  const [flashing, setFlashing] = useState(false)

  useEffect(() => {
    const sub = duration$
      .pipe(
        takeWhile((_) => _ >= -150),
        skipWhile((_) => _ > 50),
        take(1)
      )
      .subscribe(() => {
        setFlashing(true)
      })

    return () => {
      sub.unsubscribe()
    }
  }, [duration$])

  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-0 transition-colors",
        flashing && "bg-white/75",
        className
      )}
      onTransitionEnd={() => {
        setFlashing(false)
      }}
    />
  )
}
