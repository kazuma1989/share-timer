import { Debug } from "./Debug"
import { Timer } from "./Timer"
import { useRoom } from "./useRoom"

export function App() {
  const room = useRoom()

  return (
    <>
      <Timer key={room.id} roomId={room.id} />

      {import.meta.env.DEV && <Debug />}
    </>
  )
}
