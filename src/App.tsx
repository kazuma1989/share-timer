import { FlashCover } from "./FlashCover"
import { Timer } from "./Timer"
import { useObservable } from "./useObservable"
import { useRoom } from "./useRoom"
import { useTitleAsTimeViewer } from "./useTitleAsTimeViewer"

export function App() {
  const room = useObservable(useRoom())

  useTitleAsTimeViewer()

  return (
    <div className="container mx-auto h-screen">
      <Timer key={"timer" + room.id} className="h-full" />

      <FlashCover key={"cover" + room.id} />
    </div>
  )
}
