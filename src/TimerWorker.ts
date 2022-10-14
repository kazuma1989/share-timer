export {}

setInterval(() => {
  postMessage(Date.now())
}, 100)
