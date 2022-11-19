import { Observable, of } from "rxjs"
import { InvalidDoc, mapToRoom } from "../mapToRoom"
import { useFirestore } from "../useFirestore"
import { createCache } from "../util/createCache"
import { Room } from "../zod/roomZod"

export function useRoom(roomId: Room["id"]): Observable<Room | InvalidDoc> {
  const db = useFirestore()

  const room$ = hardCache(roomId, () => of(roomId).pipe(mapToRoom(db)))

  return room$
}

const hardCache = createCache(true)
