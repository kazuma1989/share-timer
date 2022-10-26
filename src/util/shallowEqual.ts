/**
 * https://github.com/reduxjs/react-redux/blob/v8.0.4/src/utils/shallowEqual.ts
 */
export function shallowEqual(objA: any, objB: any): boolean {
  if (is(objA, objB)) return true

  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i]!
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      !is(objA[key], objB[key])
    ) {
      return false
    }
  }

  return true
}

function is(x: unknown, y: unknown): boolean {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y
  } else {
    return x !== x && y !== y
  }
}
