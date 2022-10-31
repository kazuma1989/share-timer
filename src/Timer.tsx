import clsx from "clsx"
import { addDoc, serverTimestamp } from "firebase/firestore"
import { useRef } from "react"
import { Observable } from "rxjs"
import { CircleButton } from "./CircleButton"
import { DebugCheckAudioButton } from "./DebugCheckAudioButton"
import { DurationSelect } from "./DurationSelect"
import { collection } from "./firestore/collection"
import { withMeta } from "./firestore/withMeta"
import { TimerState } from "./timerReducer"
import { TimeViewer } from "./TimeViewer"
import { useAllSettled } from "./useAllSettled"
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

  return (
    <div className={clsx("grid grid-rows-[auto_1fr_auto_1fr]", className)}>
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
        <div className="relative top-5 grid min-h-fit place-items-center tabular-nums">
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

        <div className="relative top-10 flex items-center justify-around">
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

      {import.meta.env.DEV && (
        <div className="grid place-items-center">
          <DebugCheckAudioButton />
        </div>
      )}
    </div>
  )
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
