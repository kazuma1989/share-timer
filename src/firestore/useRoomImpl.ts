import type { Observable } from "rxjs"
import type { InvalidDoc, Room } from "../schema/roomSchema"
import { createCache } from "../util/createCache"
import { observeWorker } from "../util/observeWorker"
import { shareRecent } from "../util/shareRecent"
import { useFirestore } from "./useFirestore"

export function useRoomImpl(roomId: Room["id"]): Observable<Room | InvalidDoc> {
  const firestore = useFirestore()

  const room$ = hardCache(roomId, () =>
    observeWorker<Room | InvalidDoc>((onNext) =>
      firestore.onSnapshotRoom(roomId, onNext)
    ).pipe(shareRecent(30_000))
  )

  return room$
}

const hardCache = createCache(true)
