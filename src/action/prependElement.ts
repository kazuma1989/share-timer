import type { Action } from "svelte/types/runtime/action"

export const prependElement: Action<HTMLElement, HTMLElement> = (
  parent,
  child
) => {
  if (!child) return

  parent.prepend(child)

  return {
    destroy() {
      parent.removeChild(child)
    },
  }
}
