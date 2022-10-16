/// <reference lib="WebWorker" />
export {}

declare const self: DedicatedWorkerGlobalScope

interface Data {}

onMessage<Data>(() => {
  const timer = self.setInterval(() => {
    self.postMessage(null)
  }, 100)

  return () => {
    self.clearInterval(timer)
  }
})

function onMessage<T>(
  listener: (e: MessageEvent<T>) => (() => void) | void
): void {
  let unsubscribe: ReturnType<typeof listener>

  self.addEventListener("message", (e) => {
    unsubscribe?.()

    // NOTICE: unsafe cast MessageEvent<any>
    unsubscribe = listener(e)
  })
}
