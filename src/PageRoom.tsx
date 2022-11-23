import { map, merge, partition } from "rxjs"
import { FlashCover } from "./FlashCover"
import { Timer } from "./Timer"
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

  return (
    <div className="max-w-prose mx-auto h-screen">
      <Timer room$={room$} timerState$={timerState$} className="h-full" />

      <FlashCover timerState$={timerState$} />
    </div>
  )
}

const cache = createCache()
