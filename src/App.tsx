import { Debug } from "./Debug"
import { Timer } from "./Timer"
import { useRoom } from "./useRoom"
import { useRoomId } from "./useRoomId"

export function App() {
  const roomId = useRoomId()
  const room = useRoom(roomId)
  console.log(room)

  return (
    <>
      <Timer key={roomId} roomId={roomId} />

      {import.meta.env.DEV && <Debug />}
    </>
  )
}
