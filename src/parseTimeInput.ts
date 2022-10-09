export function parseTimeInput(timeInput: string): number | undefined {
  const [, minutesPart, secondsPart] =
    timeInput.match(/^(?:\s*(\d+)\s*:)?\s*(\d+)\s*$/) ?? []

  // Invalid format
  if (secondsPart === undefined) {
    return undefined
  }

  const minutes = minutesPart === undefined ? 0 : parseInt(minutesPart)
  const seconds = parseInt(secondsPart)
  // Need NaN check?
  return minutes * 60000 + seconds * 1000
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("basic", () => {
    expect(parseTimeInput("5:00")).toBe(5 * 60000)
  })

  test("white spaces", () => {
    expect(parseTimeInput(" 3    :  01   ")).toBe(3 * 60000 + 1000)
  })

  test("invalid format", () => {
    expect(parseTimeInput("x:00")).toBeUndefined()
  })
}
