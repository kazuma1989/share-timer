import { Timer } from "./Timer"
import { useRoom } from "./useRoom"

export function App() {
  const room = useRoom()

  return (
    <div className="container mx-auto h-screen">
      <Timer key={room.id} roomId={room.id} className="h-full" />
    </div>
  )
}
