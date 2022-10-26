import { Firestore } from "firebase/firestore"
import { Suspense, useState } from "react"
import { distinctUntilChanged, filter, map, Observable } from "rxjs"
import { toTimerState } from "./observeTimerState"
import { RoomObject } from "./roomIdsToRooms"
import { TimerState } from "./timerReducer"
import { useObservable } from "./useObservable"
import { Room } from "./zod/roomZod"

export function App({
  roomObjects$,
}: {
  roomObjects$: Observable<RoomObject[]>
}) {
  // useTitleAsTimeViewer()

  const roomObjects = useObservable(roomObjects$, [])

  return (
    <div className="container mx-auto h-screen">
      {roomObjects.map(({ roomId, room$, firestore }) => (
        <RoomElm key={roomId} room$={room$} firestore={firestore} />
      ))}
    </div>
  )
}

function RoomElm({
  room$,
  firestore,
}: {
  room$: RoomObject["room$"]
  firestore: Firestore
}) {
  // ほんとうに "state" だろうか？memoizeではないか？
  const [timerState$] = useState(() =>
    room$.pipe(filter((_): _ is Room => !Array.isArray(_))).pipe(
      map((_) => _.id),
      distinctUntilChanged(),
      toTimerState(firestore)
    )
  )

  return (
    <Suspense>
      <X timerState$={timerState$} />
      {/* <Timer timerState$={timerState$} className="h-full" /> */}
      {/* <FlashCover timerState$={timerState$} /> */}
    </Suspense>
  )
}

function X({ timerState$ }: { timerState$: Observable<TimerState> }) {
  const timerState = useObservable(timerState$)

  return (
    <div>
      <pre>{JSON.stringify(timerState)}</pre>
    </div>
  )
}
