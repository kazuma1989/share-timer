import { collection, orderBy, query } from "firebase/firestore"
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
    (rawData) => {
      const _ = timerAction.safeParse(rawData)
      if (_.success) {
        return _.data
      }
    }
  )

  if (!actions) {
    return <progress />
  }

  return <Timer key={roomId} roomId={roomId} actions={actions} />
}
