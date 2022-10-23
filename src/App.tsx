import { FlashCover } from "./FlashCover"
import { Timer } from "./Timer"
import { useRoom } from "./useRoom"
import { useObservable } from "./util/createStore"

export function App() {
  const room = useObservable(useRoom())

  return (
    <div className="container mx-auto h-screen">
      <Timer key={"timer" + room.id} roomId={room.id} className="h-full" />

      <FlashCover key={"cover" + room.id} />
    </div>
  )
}
