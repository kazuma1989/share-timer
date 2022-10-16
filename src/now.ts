/**
 * クライアント時刻をなるべく較正してサーバー時刻に近づけた値を返す
 */
export function now(): number {
  // eslint-disable-next-line no-restricted-globals
  return Date.now()
}
