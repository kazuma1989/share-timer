import { FlashCover } from "./FlashCover"
import { Timer } from "./Timer"
import { useObservable } from "./useObservable"
import { useRoom } from "./useRoom"

export function App() {
  const room = useObservable(useRoom())

  return (
    <div className="container mx-auto h-screen">
      <Timer key={"timer" + room.id} roomId={room.id} className="h-full" />

      <FlashCover key={"cover" + room.id} />
    </div>
  )
}
