import { Debug } from "./Debug"
import { Timer } from "./Timer"
import { useRoomId } from "./useRoomId"

export function App() {
  const roomId = useRoomId()

  return (
    <>
      <Timer key={roomId} roomId={roomId} />

      {import.meta.env.DEV && <Debug />}
    </>
  )
}
