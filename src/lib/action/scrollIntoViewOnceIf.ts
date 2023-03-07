import type { Action } from "svelte/types/runtime/action"

export const scrollIntoViewOnceIf: Action<HTMLElement, boolean> = (
  step,
  enabled
) => {
  if (!enabled) return

  step.scrollIntoView({ block: "center" })
}
