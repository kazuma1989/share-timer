import { distinctUntilChanged, map, Observable } from "rxjs"
import { FlashCover } from "./FlashCover"
import { PageType } from "./mapToPageType"
import { mapToTimerState } from "./mapToTimerState"
import { Timer } from "./Timer"
import { useFirestore } from "./useFirestore"
import { useObservable } from "./useObservable"
import { useTitleAsTimeViewer } from "./useTitleAsTimeViewer"
import { createCache } from "./util/createCache"
import { Room } from "./zod/roomZod"

export function App({
  room$,
  pageType$,
}: {
  room$: Observable<Room>
  pageType$: Observable<PageType>
}) {
  const [id] = useObservable(pageType$)
  switch (id) {
    case "info": {
      return <div className="text-9xl">id: {id}</div>
    }

    case "room": {
      return <TimerPage room$={room$} />
    }

    case "unknown": {
      return <div>unknown</div>
    }
  }
}

function TimerPage({ room$ }: { room$: Observable<Room> }) {
  const db = useFirestore()

  const timerState$ = cache(room$, () =>
    room$.pipe(
      map((_) => _.id),
      distinctUntilChanged(),
      mapToTimerState(db)
    )
  )

  useTitleAsTimeViewer(timerState$)

  return (
    <div className="container mx-auto h-screen">
      <Timer room$={room$} timerState$={timerState$} className="h-full" />

      <FlashCover timerState$={timerState$} />
    </div>
  )
}

const cache = createCache()
