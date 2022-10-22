/// <reference lib="WebWorker" />
export {}

declare const self: DedicatedWorkerGlobalScope

type Data = [type: "start", interval: number]

onMessage<Data>((e) => {
  const [, interval] = Array.isArray(e.data) ? e.data : []

  const timer = self.setInterval(() => {
    self.postMessage(null)
  }, interval ?? 1_000)

  return () => {
    self.clearInterval(timer)
  }
})

function onMessage<T>(
  listener: (e: MessageEvent<T | undefined>) => (() => void) | void
): void {
  let unsubscribe: ReturnType<typeof listener>

  self.addEventListener("message", (e) => {
    unsubscribe?.()

    // NOTICE: unsafe cast MessageEvent<any>
    unsubscribe = listener(e)
  })
}
