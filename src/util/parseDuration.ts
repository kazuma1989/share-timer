export function parseDuration(durationMs: number): {
  hours: number
  minutes: number
  seconds: number
} {
  if (durationMs <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  }

  // durationMs = 3921_456
  // milliseconds = 456
  const milliseconds = durationMs % 1_000

  // durationSec = 3921
  const durationSec = (durationMs - milliseconds) / 1_000

  // seconds = 21
  const seconds = durationSec % 60

  // durationMin = 65
  const durationMin = (durationSec - seconds) / 60

  // minutes = 5
  const minutes = durationMin % 60

  // hours = 1
  const hours = (durationMin - minutes) / 60

  return {
    hours,
    minutes,
    seconds,
  }
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("basic", () => {
    const parsed = parseDuration(2 * 3600_000 + 19 * 60_000 + 43_000)

    expect(parsed).toStrictEqual({
      hours: 2,
      minutes: 19,
      seconds: 43,
    } satisfies typeof parsed)
  })
}
