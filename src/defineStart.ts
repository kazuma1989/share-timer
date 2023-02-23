export function defineStart<T extends (target: HTMLElement) => unknown>(
  start: T
): T {
  return start
}
