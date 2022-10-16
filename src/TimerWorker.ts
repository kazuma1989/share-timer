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
    // Workerコンテキストでnow()関数が使えない気がするのでeslintはdisableにしておく。
    // うまく使う方法がわかったら解除して較正時刻を使いたい。
    // eslint-disable-next-line no-restricted-globals
    const d = Date.now() - startedAt
    const delta = d - (d % 1_000)

    const current = duration - delta > 0 ? duration - delta : 0
    if (current !== previous) {
      self.postMessage(current)

      previous = current
    }
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
