import clsx from "clsx"
import { addDoc, serverTimestamp } from "firebase/firestore"
import { useCallback, useRef, useState, useSyncExternalStore } from "react"
import { Observable } from "rxjs"
import { CircleButton } from "./CircleButton"
import { DurationSelect } from "./DurationSelect"
import { collection } from "./firestore/collection"
import { withMeta } from "./firestore/withMeta"
import { icon } from "./icon"
import { InformationDialog } from "./InformationDialog"
import { TimerState } from "./timerReducer"
import { TimeViewer } from "./TimeViewer"
import { TransparentButton } from "./TransparentButton"
import { useAllSettled } from "./useAllSettled"
import { useMediaPermission } from "./useAudio"
import { useFirestore } from "./useFirestore"
import { useObservable } from "./useObservable"
import { ActionOnFirestore } from "./zod/actionZod"
import { Room } from "./zod/roomZod"

function useDialogOpen(
  dialog: HTMLDialogElement | null | undefined
): boolean | undefined {
  const subscribe = useCallback(
    (onStoreChange: () => void): (() => void) => {
      if (!dialog) {
        return () => {}
      }

      const observer = new MutationObserver(() => {
        onStoreChange()
      })

      observer.observe(dialog, { attributes: true, attributeFilter: ["open"] })

      return () => {
        observer.disconnect()
      }
    },
    [dialog]
  )

  return useSyncExternalStore(subscribe, () => dialog?.open)
}

export function Timer({
  room$,
  timerState$,
  className,
}: {
  room$: Observable<Room>
  timerState$: Observable<TimerState>
  className?: string
}) {
  const { id: roomId, name: roomName } = useObservable(room$)
  const state = useObservable(timerState$)

  const [pending, dispatch] = useDispatch(roomId)

  const durationSelect$ = useRef({
    value: state.initialDuration,
  })
  const primaryButton$ = useRef<HTMLButtonElement>(null)

  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null)
  const dialogOpen = useDialogOpen(dialog)

  return (
    <>
      <div
        className={clsx(
          "grid grid-rows-[auto_5fr_auto_4fr]",
          "transition-transform",
          dialogOpen && "scale-95",
          className
        )}
      >
        <div className="pt-2 text-center">
          <h1>{roomName}</h1>
        </div>

        <form
          className="contents"
          onSubmit={async (e) => {
            e.preventDefault()

            if (state.mode !== "editing") return

            dispatch({
              type: "start",
              withDuration: durationSelect$.current.value,
              at: serverTimestamp(),
            })

            primaryButton$.current?.focus()
          }}
        >
          <div className="grid min-h-[8rem] place-items-center tabular-nums">
            {state.mode === "editing" ? (
              <DurationSelect
                key={state.mode + state.initialDuration}
                innerRef={durationSelect$}
                defaultValue={state.initialDuration}
              />
            ) : (
              <div className="text-8xl font-thin sm:text-9xl">
                <TimeViewer timerState$={timerState$} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-around">
            <CircleButton
              disabled={state.mode === "editing"}
              className="text-xs"
              onClick={() => {
                dispatch({
                  type: "cancel",
                })
              }}
            >
              キャンセル
            </CircleButton>

            {state.mode === "editing" ? (
              <CircleButton
                innerRef={primaryButton$}
                color="green"
                type="submit"
              >
                開始
              </CircleButton>
            ) : state.mode === "running" ? (
              <CircleButton
                innerRef={primaryButton$}
                color="orange"
                onClick={() => {
                  dispatch({
                    type: "pause",
                    at: serverTimestamp(),
                  })
                }}
              >
                一時停止
              </CircleButton>
            ) : (
              <CircleButton
                innerRef={primaryButton$}
                color="green"
                onClick={() => {
                  if (pending) return

                  dispatch({
                    type: "resume",
                    at: serverTimestamp(),
                  })
                }}
              >
                再開
              </CircleButton>
            )}
          </div>
        </form>

        <div className="flex items-center justify-evenly px-6">
          <TransparentButton
            title="フラッシュを切り替える"
            className="h-12 w-12 text-2xl"
            // TODO toggle flash
            onClick={() => {}}
          >
            {icon("flash")}
          </TransparentButton>

          <TransparentButton
            title="音を切り替える"
            className="h-12 w-12 text-2xl"
            // TODO toggle volume
            onClick={() => {}}
          >
            <VolumeIcon />
          </TransparentButton>

          <TransparentButton
            title="情報を開く"
            className="h-12 w-12 text-2xl"
            onClick={() => {
              dialog?.showModal()
            }}
          >
            {icon("information")}
          </TransparentButton>
        </div>
      </div>

      <InformationDialog innerRef={setDialog} />
    </>
  )
}

function VolumeIcon() {
  const permission = useObservable(useMediaPermission(), "denied")

  return permission === "canplay" ? icon("volume-high") : icon("volume-off")
}

function useDispatch(
  roomId: Room["id"]
): [
  pending: boolean,
  dispatch: (action: ActionOnFirestore) => Promise<unknown>
] {
  const [_allSettled, addPromise] = useAllSettled()
  const pending = !_allSettled

  const db = useFirestore()

  return [
    pending,
    (action) =>
      addPromise(
        addDoc(collection(db, "rooms", roomId, "actions"), withMeta(action))
      ),
  ]
}
