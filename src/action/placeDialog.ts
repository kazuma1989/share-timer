import type { Action } from "svelte/types/runtime/action"

export const placeDialog: Action<HTMLDialogElement, HTMLElement> = (
  dialog,
  target
) => {
  const target$ = { current: target }

  const resize = new ResizeObserver(() => {
    const target = target$.current
    if (!target) return

    const { top, left, width, height } = target.getBoundingClientRect()

    dialog.style.top = `${top}px`
    dialog.style.left = `${left}px`
    dialog.style.width = `${width}px`
    dialog.style.height = `${height}px`
  })

  resize.observe(document.body)

  return {
    update(target) {
      target$.current = target
    },

    destroy() {
      resize.disconnect()
    },
  }
}
