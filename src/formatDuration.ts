export function formatDuration(durationMs: number): string {
  // durationMs = 321_456
  // milliseconds = 456
  const milliseconds = durationMs % 1000

  // durationSec = 321
  const durationSec = (durationMs - milliseconds) / 1000

  // seconds = 21
  const seconds = durationSec % 60

  // minutes = 3
  const minutes = (durationSec - seconds) / 60

  return [minutes.toString(), seconds.toString().padStart(2, "0")].join(":")
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("basic", () => {
    expect(formatDuration(5 * 60000)).toBe("5:00")
  })

  test("omit milliseconds unit", () => {
    expect(formatDuration(3 * 60000 + 1000 + 789)).toBe("3:01")
  })
}
