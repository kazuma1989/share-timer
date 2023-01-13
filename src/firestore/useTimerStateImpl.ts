import { proxy } from "comlink"
import { Observable } from "rxjs"
import type { TimerState } from "../timerReducer"
import { createCache } from "../util/createCache"
import { shareRecent } from "../util/shareRecent"
import type { Room } from "../zod/roomZod"
import { useFirestore } from "./useFirestore"

export function useTimerStateImpl(roomId: Room["id"]): Observable<TimerState> {
  const firestore = useFirestore()

  const timerState$ = hardCache(roomId, () =>
    new Observable<TimerState>((subscriber) => {
      console.debug("actions listener attached")

      const unsubscribe$ = firestore.onSnapshotTimerState(
        roomId,
        proxy((data) => {
          subscriber.next(data)
        })
      )

      return async () => {
        const unsubscribe = await unsubscribe$
        unsubscribe()
      }
    }).pipe(shareRecent(30_000))
  )

  return timerState$
}

const hardCache = createCache(true)
