import clsx from "clsx"
import { addDoc, serverTimestamp } from "firebase/firestore"
import { useRef } from "react"
import { CheckAudioButton } from "./CheckAudioButton"
import { CircleButton } from "./CircleButton"
import { DurationSelect } from "./DurationSelect"
import { collection } from "./firestore/collection"
import { withMeta } from "./firestore/withMeta"
import { useAllSettled } from "./useAllSettled"
import { useCurrentDurationUI } from "./useCurrentDuration"
import { useFirestore } from "./useFirestore"
import { useObservable } from "./useObservable"
import { useRoom } from "./useRoom"
import { useTimerState } from "./useTimerState"
import { formatDuration } from "./util/formatDuration"
import { ActionOnFirestore } from "./zod/actionZod"

export function Timer({ className }: { className?: string }) {
  const state = useObservable(useTimerState())

  const [_allSettled, addPromise] = useAllSettled()
  const pending = !_allSettled

  const db = useFirestore()
  const { id: roomId } = useObservable(useRoom())
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
            {state.mode === "running" ? (
              <TimeViewer>
                {(restDuration) => (
                  <span>{formatDuration(restDuration ?? 0)}</span>
                )}
              </TimeViewer>
            ) : (
              <span>{formatDuration(state.restDuration)}</span>
            )}
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
          <CheckAudioButton />
        </div>
      )}
    </form>
  )
}

function TimeViewer({
  children,
}: {
  children?: (restDuration: number | undefined) => JSX.Element
}) {
  const duration = useObservable(useCurrentDurationUI())

  return children?.(duration) ?? null
}
