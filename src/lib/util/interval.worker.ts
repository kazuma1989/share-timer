import { expose, proxy, type ProxyMarked } from "comlink"

export function setInterval(
  onInterval: (() => void) & ProxyMarked,
  ms: number
): (() => void) & ProxyMarked {
  const timer = globalThis.setInterval(onInterval, ms)

  return proxy(() => {
    globalThis.clearInterval(timer)
  })
}

expose(setInterval)
