import type { Action } from "svelte/types/runtime/action"

export const showModal: Action<HTMLDialogElement, boolean> = (
  dialog,
  show = false
) => {
  const changeOpen = (show: boolean) => {
    if (show) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      dialog.close()
    }
  }

  changeOpen(show)

  return {
    update: changeOpen,
  }
}
