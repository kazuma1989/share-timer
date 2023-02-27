import type { Room } from "$lib/schema/roomSchema"
import type { TimerState } from "$lib/schema/timerReducer"
import { createCache } from "$lib/util/createCache"
import { observeWorker } from "$lib/util/observeWorker"
import { shareRecent } from "$lib/util/shareRecent"
import type { Observable } from "rxjs"
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
