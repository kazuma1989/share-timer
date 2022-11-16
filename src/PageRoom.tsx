import { map, merge, partition } from "rxjs"
import { FlashCover } from "./FlashCover"
import { isRoom } from "./mapToRoom"
import { Timer } from "./Timer"
import { useObservable } from "./useObservable"
import { useRoom } from "./useRoom"
import { useTimerState } from "./useTimerState"
import { useTitleAsTimeViewer } from "./useTitleAsTimeViewer"
import { createCache } from "./util/createCache"
import { Room } from "./zod/roomZod"

export function PageRoom({ roomId }: { roomId: Room["id"] }) {
  const _room$ = useRoom(roomId)
  const [room$, invalidRoomId$] = cache(_room$, () => {
    const [room$, invalid$] = partition(_room$, isRoom)

    const invalidRoomId$ = merge(
      room$.pipe(map(() => null)),
      invalid$.pipe(map(([, roomId]) => roomId))
    )

    return [room$, invalidRoomId$]
  })

  const invalidRoomId = useObservable(invalidRoomId$)
  if (invalidRoomId) {
    throw invalidRoomId
  }

  const timerState$ = useTimerState(room$)

  useTitleAsTimeViewer(timerState$)

  return (
    <div className="max-w-prose mx-auto h-screen">
      <Timer room$={room$} timerState$={timerState$} className="h-full" />

      <FlashCover timerState$={timerState$} />
    </div>
  )
}

const cache = createCache()
