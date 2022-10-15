/// <reference lib="WebWorker" />
export {}

declare const self: DedicatedWorkerGlobalScope

interface Data {
  mode: "paused" | "running" | "editing"
  restDuration: number
  duration: number
  startedAt: number
}

onMessage<Data>((e) => {
  const { mode, restDuration, duration, startedAt } = e.data

  switch (mode) {
    case "paused": {
      postMessageNumber(restDuration)
      return
    }

    case "running": {
      let previous: number

      const timer = self.setInterval(() => {
        const d = Date.now() - startedAt
        const delta = d - (d % 1_000)

        const current = duration - delta > 0 ? duration - delta : 0
        if (current !== previous) {
          postMessageNumber(current)

          previous = current
        }
      }, 100)

      return () => {
        self.clearInterval(timer)
      }
    }
  }
})

function postMessageNumber(message: number): void {
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
