import { timeInputZod } from "./timeInputZod"

export function parseTimeInput(timeInput: string): number {
  return timeInputZod.parse(timeInput)
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("basic", () => {
    expect(parseTimeInput("5:00")).toBe(5 * 60_000)
  })

  test("white spaces", () => {
    expect(parseTimeInput(" 3    :  01   ")).toBe(3 * 60_000 + 1_000)
  })

  test("invalid format", () => {
    expect(() => parseTimeInput("x:00")).toThrow()
  })
}
