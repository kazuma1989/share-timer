import { parseDuration } from "./parseDuration"

export function formatDuration(durationMs: number): string {
  const sign = durationMs >= 0 ? "" : "-"
  const { hours, minutes, seconds } = parseDuration(Math.abs(durationMs))

  return (
    sign +
    [
      ...(hours ? [hours] : []),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":")
  )
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("basic", () => {
    expect(formatDuration(5 * 60_000)).toBe("05:00")
  })

  test("omit milliseconds unit", () => {
    expect(formatDuration(3 * 60_000 + 1_000 + 789)).toBe("03:01")
  })

  test("hours", () => {
    expect(formatDuration(65 * 60_000)).toBe("1:05:00")
  })

  test("negative", () => {
    expect(formatDuration(-60_000)).toBe("-01:00")
  })
}
