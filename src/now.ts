/**
 * クライアント時刻をなるべく較正してサーバー時刻に近づけた値を返す
 */
export function now(): number {
  // eslint-disable-next-line no-restricted-globals
  const _now = Date.now()
  return _now + _estimatedDiff
}

/**
 * serverTimestamp() - Timestamp.now()
 */
let _estimatedDiff = 0

export function setEstimatedDiff(value: number): void {
  _estimatedDiff = value

  import.meta.env.DEV &&
    console.info("diff (serverTime - clientTime)", _estimatedDiff)
}
