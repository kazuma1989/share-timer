/**
 * https://github.com/reduxjs/react-redux/blob/v8.0.4/src/utils/shallowEqual.ts
 */
export function shallowEqual<T>(objA: T, objB: T): boolean {
  if (is(objA, objB)) return true

  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false
  }

  const keysA = Object.keys(objA) as (keyof T)[]
  const keysB = Object.keys(objB) as (keyof T)[]

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

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("equal", () => {
    expect(
      shallowEqual(
        {
          name: "John",
          age: 30,
        },
        {
          name: "John",
          age: 30,
        }
      )
    ).toBeTruthy()
  })

  test("not equal", () => {
    expect(
      shallowEqual(
        {
          name: "John",
          age: 30,
        },
        {
          name: "Jane",
          age: 30,
        }
      )
    ).toBeFalsy()
  })

  test("array", () => {
    expect(shallowEqual(["John", "Jane"], ["John", "Jane"])).toBeTruthy()
    expect(shallowEqual(["John", "Jane"], ["Jane", "John"])).toBeFalsy()
  })
}
