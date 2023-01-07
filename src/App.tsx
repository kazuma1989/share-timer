// @ts-expect-error
import { lazy } from "react"
import type { Observable } from "rxjs"
import { replaceHash } from "./observeHash"
import { PageRoom } from "./PageRoom"
import { SetupRoom } from "./SetupRoom"
import type { Route } from "./toRoute"
import { useObservable } from "./useObservable"
import { suspend } from "./util/suspend"
import { newRoomId } from "./zod/roomZod"

const PageInfo = lazy(() =>
  import("./PageInfo").then((_) => ({ default: _.PageInfo }))
)

export function App(props: { route$: Observable<Route> }) {
  return (
    <SetupRoom>
      <AppInner {...props} />
    </SetupRoom>
  )
}

function AppInner({ route$ }: { route$: Observable<Route> }) {
  const [route, payload] = useObservable(route$)

  switch (route) {
    case "info": {
      const roomId = payload
      return <PageInfo roomId={roomId} />
    }

    case "room": {
      const roomId = payload
      return <PageRoom roomId={roomId} />
    }

    case "newRoom": {
      return suspend(() => {
        replaceHash(["room", newRoomId()])
      })
    }

    case "unknown": {
      return <div>404 &quot;{payload}&quot;</div>
    }
  }
}
