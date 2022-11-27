import clsx from "clsx"
import { useRef } from "react"
import { map, merge, partition } from "rxjs"
import { FlashCover } from "./FlashCover"
import { Timer } from "./Timer"
import { TransparentButton } from "./TransparentButton"
import { useObservable } from "./useObservable"
import { useRoom } from "./useRoom"
import { useTimerState } from "./useTimerState"
import { useTitleAsTimeViewer } from "./useTitleAsTimeViewer"
import { createCache } from "./util/createCache"
import { isRoom, Room } from "./zod/roomZod"

export function PageRoom({ roomId }: { roomId: Room["id"] }) {
  const _room$ = useRoom(roomId)
  const [room$, invalid$] = cache(_room$, () => {
    const [room$, _invalid$] = partition(_room$, isRoom)
    const invalid$ = merge(room$.pipe(map(() => null)), _invalid$)

    return [room$, invalid$]
  })

  const invalid = useObservable(invalid$)
  if (invalid) {
    throw invalid
  }

  const timerState$ = useTimerState(roomId)

  useTitleAsTimeViewer(timerState$)

  const dialog$ = useRef<HTMLDialogElement | null>(null)

  return (
    <div className="max-w-prose mx-auto h-screen">
      <Timer room$={room$} timerState$={timerState$} className="h-full" />

      <FlashCover timerState$={timerState$} />

      <dialog
        className={clsx(
          "transition-[opacity,visibility] [&:not([open])]:opacity-0",
          "w-full h-full text-inherit bg-dark/10 dark:bg-light/20",
          // override default dialog style
          "fixed inset-0 p-0 max-w-full max-h-full backdrop:bg-transparent open:visible [&:not([open])]:invisible [&:not([open])]:block"
        )}
        ref={(dialog) => {
          dialog$.current = dialog

          if (dialog && !dialog.open) {
            dialog.showModal()
          }
        }}
        onClick={() => {
          dialog$.current?.close()
        }}
      >
        <article
          className={clsx(
            "overscroll-contain rounded border",
            "border-neutral-300 bg-light dark:border-neutral-700 dark:bg-dark",
            "p-8 m-4"
          )}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          hello
          <TransparentButton
            className="w-full border border-gray-500 block px-4 py-3"
            onClick={() => {
              dialog$.current?.close()
            }}
          >
            OK!
          </TransparentButton>
        </article>
      </dialog>
    </div>
  )
}

const cache = createCache()
