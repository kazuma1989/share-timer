let _now = Date.now()

export function subscribeTimer(next: () => void): () => void {
  const abort = new AbortController()

  const tick = () => {
    if (abort.signal.aborted) return

    requestAnimationFrame(tick)

    _now = Date.now()
    next()
  }

  tick()

  return () => {
    abort.abort()
  }
}

export function now() {
  return _now
}
