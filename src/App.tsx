import { FlashCover } from "./FlashCover"
import { Timer } from "./Timer"
import { useRoom } from "./useRoom"

export function App() {
  const room = useRoom()

  return (
    <div className="container mx-auto h-screen">
      <Timer key={"timer" + room.id} roomId={room.id} className="h-full" />

      <FlashCover key={"cover" + room.id} roomId={room.id} />
    </div>
  )
}
