import { expose, proxy, type ProxyMarked } from "comlink"

export class RemoteInterval {
  setInterval(
    onInterval: (() => void) & ProxyMarked,
    ms: number
  ): (() => void) & ProxyMarked {
    const timer = setInterval(onInterval, ms)

    return proxy(() => {
      clearInterval(timer)
    })
  }
}

if (!import.meta.vitest) {
  expose(RemoteInterval)
}
