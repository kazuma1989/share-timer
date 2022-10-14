export function formatDuration(durationMs: number): string {
  if (durationMs <= 0) {
    return "0:00"
  }

  // durationMs = 321_456
  // milliseconds = 456
  const milliseconds = durationMs % 1_000

  // durationSec = 321
  const durationSec = (durationMs - milliseconds) / 1_000

  // seconds = 21
  const seconds = durationSec % 60

  // minutes = 3
  const minutes = (durationSec - seconds) / 60

  return [minutes.toString(), seconds.toString().padStart(2, "0")].join(":")
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("basic", () => {
    expect(formatDuration(5 * 60_000)).toBe("5:00")
  })

  test("omit milliseconds unit", () => {
    expect(formatDuration(3 * 60_000 + 1_000 + 789)).toBe("3:01")
  })

  test("negative", () => {
    expect(formatDuration(-60_000)).toBe("0:00")
  })
}
