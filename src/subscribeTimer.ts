let _now = Date.now()

export function subscribeTimer(onChange: () => void): () => void {
  const abort = new AbortController()

  const tick = () => {
    if (abort.signal.aborted) return

    requestAnimationFrame(tick)

    _now = Date.now()
    onChange()
  }

  tick()

  return () => {
    abort.abort()
  }
}

export function now() {
  return _now
}
