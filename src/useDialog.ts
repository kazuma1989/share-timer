import { useCallback, useState, useSyncExternalStore } from "react"

interface Dialog {
  open: boolean | undefined
  close(): void
  show(): void
  showModal(): void
  element: HTMLDialogElement | null
}

export function useDialog(): [
  dialog: Dialog,
  setDialog: (dialog: Dialog["element"]) => void
] {
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null)

  const open = useSyncExternalStore(
    useCallback(
      (onStoreChange) => {
        if (!dialog) {
          return () => {}
        }

        const observer = new MutationObserver(() => {
          onStoreChange()
        })

        observer.observe(dialog, {
          attributes: true,
          attributeFilter: ["open"],
        })

        return () => {
          observer.disconnect()
        }
      },
      [dialog]
    ),
    () => dialog?.open
  )

  return [
    {
      open,
      close() {
        dialog?.close()
      },
      show() {
        dialog?.show()
      },
      showModal() {
        dialog?.showModal()
      },
      element: dialog,
    },
    setDialog,
  ]
}
