import { query } from "firebase/firestore"
import { collection } from "./collection"
import { Debug } from "./Debug"
import { orderBy } from "./orderBy"
import { Timer } from "./Timer"
import { timerAction } from "./timerAction"
import { useCollection } from "./useCollection"
import { useRoomId } from "./useRoomId"

export function App() {
  const roomId = useRoomId()

  const actions = useCollection(
    (db) =>
      query(
        collection(db, "rooms", roomId, "actions"),
        orderBy("createdAt", "asc")
      ),
    (rawData) => timerAction.parse(rawData)
  )

  return (
    <>
      <Timer key={roomId} roomId={roomId} actions={actions} />

      {import.meta.env.DEV && <Debug />}
    </>
  )
}
