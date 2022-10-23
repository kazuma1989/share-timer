import clsx from "clsx"
import { useState } from "react"
import { map, skipWhile, take, takeWhile } from "rxjs"
import { useCurrentDurationUI } from "./useCurrentDuration"
import { useTimerState } from "./useTimerState"
import { useObservable } from "./util/createStore"

export function FlashCover({ className }: { className?: string }) {
  const { mode } = useObservable(useTimerState())

  const state = mode === "editing" ? "asleep" : "awake"

  return (
    <FlashCoverInner
      key={state}
      className={clsx(state === "asleep" && "hidden", className)}
    />
  )
}

function FlashCoverInner({ className }: { className?: string }) {
  const duration$ = useCurrentDurationUI()

  const [flashing$] = useState(() =>
    duration$.pipe(
      takeWhile((_) => _ >= -150),
      skipWhile((_) => _ > 50),
      take(1),
      map(() => true)
    )
  )

  const flashing = useObservable(flashing$, false)

  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-0",
        flashing && "animate-[flash_1s_ease-out]",
        className
      )}
    />
  )
}
