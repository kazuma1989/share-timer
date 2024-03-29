import type { Observable } from "rxjs"
import type { Room } from "../schema/roomSchema"
import type { TimerState } from "../schema/timerReducer"
import { createCache } from "../util/createCache"
import { observeWorker } from "../util/observeWorker"
import { shareRecent } from "../util/shareRecent"
import { useFirestore } from "./useFirestore"

export function useTimerStateImpl(roomId: Room["id"]): Observable<TimerState> {
  const firestore = useFirestore()

  const timerState$ = hardCache(roomId, () =>
    observeWorker<TimerState>((onNext) => {
      console.debug("actions listener attached")

      return firestore.onSnapshotTimerState(roomId, onNext)
    }).pipe(shareRecent(30_000))
  )

  return timerState$
}

const hardCache = createCache(true)
