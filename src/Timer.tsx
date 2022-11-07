import clsx from "clsx"
import { addDoc, serverTimestamp } from "firebase/firestore"
import { useRef } from "react"
import { Observable } from "rxjs"
import { CircleButton } from "./CircleButton"
import { DurationSelect } from "./DurationSelect"
import { collection } from "./firestore/collection"
import { withMeta } from "./firestore/withMeta"
import { icon } from "./icon"
import { TimerState } from "./timerReducer"
import { TimeViewer } from "./TimeViewer"
import { TransparentButton } from "./TransparentButton"
import { useAllSettled } from "./useAllSettled"
import { useMediaPermission } from "./useAudio"
import { useFirestore } from "./useFirestore"
import { useObservable } from "./useObservable"
import { ActionOnFirestore } from "./zod/actionZod"
import { Room } from "./zod/roomZod"

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

  const dialog$ = useRef<HTMLDialogElement>(null)

  return (
    <div className={clsx("grid grid-rows-[auto_5fr_auto_4fr]", className)}>
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
            <CircleButton innerRef={primaryButton$} color="green" type="submit">
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
            dialog$.current?.showModal()
          }}
        >
          {icon("information")}
        </TransparentButton>

        <dialog
          ref={dialog$}
          className={clsx(
            "h-full container top-[3vh] max-h-[calc(100%-3vh)] overscroll-contain rounded-t-lg border border-b-0 max-w-prose",
            "border-neutral-300 bg-light text-inherit dark:border-neutral-700 dark:bg-dark",
            "open:shadow-screen open:shadow-dark/10 dark:open:shadow-light/20",
            "transition-[box-shadow,transform,visibility] duration-300 translate-y-full open:translate-y-0",
            // override default dialog style
            "fixed p-0 backdrop:bg-transparent open:visible [&:not([open])]:invisible [&:not([open])]:block"
          )}
          onClick={() => {
            dialog$.current?.close()
          }}
        >
          <article
            className={clsx(
              "min-h-full min-w-full py-12 px-6",
              "prose prose-headings:text-dark/70 prose-p:text-dark/90 prose-a:text-azure-700 prose-headings:dark:text-light/70 prose-p:dark:text-light/90 prose-a:dark:text-azure-300"
            )}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <h1>
              <ruby>
                Share Timer <rp>(</rp>
                <rt className="text-xs">シェア タイマー</rt>
                <rp>)</rp>
              </ruby>
            </h1>

            <p>URL でタイマーを簡単共有！</p>

            <p>
              このタイマーの URL
              <br />
              <a href={location.href}>{location.href}</a>
            </p>

            <p>※ タイマーは誰でも開始／一時停止／キャンセルができます</p>
          </article>
        </dialog>
      </div>
    </div>
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
