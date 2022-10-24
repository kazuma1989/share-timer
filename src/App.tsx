import { FlashCover } from "./FlashCover"
import { Timer } from "./Timer"
import { useObservable } from "./useObservable"
import { useRoom } from "./useRoom"
import { useTimerState } from "./useTimerState"
import { useTitleAsTimeViewer } from "./useTitleAsTimeViewer"

export function App() {
  const room = useObservable(useRoom())

  useTitleAsTimeViewer()

  const timerState$ = useTimerState()

  return (
    <div className="container mx-auto h-screen">
      <Timer
        key={"timer" + room.id}
        timerState$={timerState$}
        className="h-full"
      />

      <FlashCover key={"cover" + room.id} timerState$={timerState$} />
    </div>
  )
}
