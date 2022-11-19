import { Observable, of } from "rxjs"
import { InvalidDoc, mapToRoom } from "../mapToRoom"
import { createCache } from "../util/createCache"
import { Room } from "../zod/roomZod"
import { useFirestore } from "./useFirestore"

export function useRoomImpl(roomId: Room["id"]): Observable<Room | InvalidDoc> {
  const db = useFirestore()

  const room$ = hardCache(roomId, () => of(roomId).pipe(mapToRoom(db)))

  return room$
}

const hardCache = createCache(true)
