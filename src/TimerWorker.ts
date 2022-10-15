/// <reference lib="WebWorker" />
export {}

declare const self: DedicatedWorkerGlobalScope

interface Data {
  duration: number
  startedAt: number
}

onMessage<Data>((e) => {
  const { duration, startedAt } = e.data

  let previous: number

  const timer = self.setInterval(() => {
    const d = Date.now() - startedAt
    const delta = d - (d % 1_000)

    const current = duration - delta > 0 ? duration - delta : 0
    if (current !== previous) {
      postMessage(current)

      previous = current
    }
  }, 100)

  return () => {
    self.clearInterval(timer)
  }
})

function postMessage(message: number): void {
  self.postMessage(message)
}

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
