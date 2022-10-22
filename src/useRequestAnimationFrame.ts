import { useSyncExternalStore } from "react"
import { now } from "./now"
import { subscribeAnimationFrame } from "./util/subscribeAnimationFrame"

export function useRequestAnimationFrame<T>(
  getSnapshot: (now: number) => T
): T {
  return useSyncExternalStore(subscribe, () => getSnapshot(_now))
}

let _now = now()

const subscribe: typeof subscribeAnimationFrame = (next) =>
  subscribeAnimationFrame(() => {
    _now = now()
    next()
  })
