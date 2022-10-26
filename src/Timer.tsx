import clsx from "clsx"
import { addDoc, serverTimestamp } from "firebase/firestore"
import { Suspense, useMemo, useRef } from "react"
import { distinctUntilChanged, map, Observable } from "rxjs"
import { CircleButton } from "./CircleButton"
import { DebugCheckAudioButton } from "./DebugCheckAudioButton"
import { DurationSelect } from "./DurationSelect"
import { collection } from "./firestore/collection"
import { withMeta } from "./firestore/withMeta"
import { toCurrentDuration } from "./observeCurrentDuration"
import { TimerState } from "./timerReducer"
import { useAllSettled } from "./useAllSettled"
import { useFirestore } from "./useFirestore"
import { useObservable } from "./useObservable"
import { formatDuration } from "./util/formatDuration"
import { floor, interval } from "./util/interval"
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
  console.count("Timer")
  const state = useObservable(timerState$)

  const duration$ = useMemo(
    () =>
      timerState$.pipe(
        toCurrentDuration(interval("ui")),
        map((_) => ({
          ..._,
          duration: floor(_.duration),
        })),
        distinctUntilChanged(
          (left, right) =>
            left.mode === right.mode && left.duration === right.duration
        ),
        map((_) => _.duration)
      ),
    [timerState$]
  )

  const [_allSettled, addPromise] = useAllSettled()
  const pending = !_allSettled

  const db = useFirestore()
  const { id: roomId } = useObservable(room$)
  const dispatch = (action: ActionOnFirestore) =>
    addPromise(
      addDoc(collection(db, "rooms", roomId, "actions"), withMeta(action))
    )

  const durationSelect$ = useRef({
    value: state.initialDuration,
  })
  const primaryButton$ = useRef<HTMLButtonElement>(null)

  return (
    <form
      className={clsx("grid grid-rows-[1fr_auto_1fr]", className)}
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
            <Suspense>
              <TimeViewer duration$={duration$}>
                {(duration) => <span>{formatDuration(duration)}</span>}
              </TimeViewer>
            </Suspense>
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

      {import.meta.env.DEV && (
        <div className="grid place-items-center">
          <DebugCheckAudioButton />
        </div>
      )}
    </form>
  )
}

function TimeViewer({
  duration$,
  children,
}: {
  duration$: Observable<number>
  children?: (restDuration: number) => JSX.Element
}) {
  const duration = useObservable(duration$)
  console.count("TimeViewer")

  return children?.(duration) ?? null
}
