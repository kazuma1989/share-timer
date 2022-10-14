/// <reference lib="WebWorker" />
export {}

declare const self: DedicatedWorkerGlobalScope

interface Data {
  mode: "paused" | "running" | "editing"
  restDuration: number
  duration: number
  startedAt: number
}

let timer: number

self.addEventListener("message", (e) => {
  const { mode, restDuration, duration, startedAt }: Data = e.data

  switch (mode) {
    case "paused": {
      self.postMessage(restDuration)
      break
    }

    case "running": {
      let previous: number

      self.clearInterval(timer)

      timer = self.setInterval(() => {
        const d = Date.now() - startedAt
        const delta = d - (d % 1_000)

        const current = duration - delta > 0 ? duration - delta : 0
        if (current !== previous) {
          self.postMessage(current)

          previous = current
        }
      }, 100)
      break
    }
  }
})
