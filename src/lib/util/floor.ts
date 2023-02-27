export function floor(v: number): number {
  return v - (v % 1000) + (v >= 0 ? 0 : -1000)
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("basic", () => {
    expect(floor(1234)).toBe(1000)
  })

  test("zero", () => {
    expect(floor(234)).toBe(0)
  })

  test("negative", () => {
    expect(floor(-1)).toBe(-1000)
  })

  test("negative 2", () => {
    expect(floor(-1234)).toBe(-2000)
  })
}
