import { FlashCover } from "./FlashCover"
import { Timer } from "./Timer"
import { useRoom } from "./useRoom"
import { useObservable } from "./util/createStore"

export function App() {
  const room = useObservable(useRoom())

  if (import.meta.env.DEV) {
    return (
      <div>
        <pre>{JSON.stringify(room, null, 2)}</pre>
      </div>
    )
  }

  return (
    <div className="container mx-auto h-screen">
      <Timer key={"timer" + room.id} roomId={room.id} className="h-full" />

      <FlashCover key={"cover" + room.id} roomId={room.id} />
    </div>
  )
}
