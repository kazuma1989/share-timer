import { proxy } from "comlink"
import type { DocumentData } from "firebase/firestore"
import { map, Observable } from "rxjs"
import { timerReducer, type TimerState } from "../timerReducer"
import { createCache } from "../util/createCache"
import { shareRecent } from "../util/shareRecent"
import { actionZod, type Action } from "../zod/actionZod"
import type { Room } from "../zod/roomZod"
import { useFirestore } from "./useFirestore"

export function useTimerStateImpl(roomId: Room["id"]): Observable<TimerState> {
  const firestore = useFirestore()

  const timerState$ = hardCache(roomId, () =>
    new Observable<DocumentData[]>((subscriber) => {
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
    }).pipe(
      map((docs) => {
        const actions = docs.flatMap((doc): Action[] => {
          const _ = actionZod.safeParse(doc)
          return _.success ? [_.data] : []
        })

        return actions.reduce(timerReducer, {
          mode: "editing",
          initialDuration: 0,
        })
      }),

      shareRecent(30_000)
    )
  )

  return timerState$
}

const hardCache = createCache(true)
