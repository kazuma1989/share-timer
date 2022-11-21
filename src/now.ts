/**
 * クライアント時刻をなるべく較正してサーバー時刻に近づけた値を返す
 */
export function now(): number {
  return _now() + _estimatedDiff
}

const fakeDelta = Math.floor(4_000 * Math.random() - 2_000)
const _now = import.meta.env.DEV
  ? () =>
      // eslint-disable-next-line no-restricted-globals
      Date.now() + fakeDelta
  : () =>
      // eslint-disable-next-line no-restricted-globals
      Date.now()

/**
 * serverTimestamp() - Timestamp.now()
 */
let _estimatedDiff = 0

export function setEstimatedDiff(value: number): void {
  _estimatedDiff = value

  import.meta.env.DEV &&
    console.info("diff (serverTime - clientTime)", _estimatedDiff)
}
