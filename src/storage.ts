import { Room } from "./zod/roomZod"

export function getItem(key: "recent-room-id"): string | null

export function getItem(key: string): unknown {
  const raw = localStorage.getItem(key)

  const _ = safeParse(raw ?? "")
  return _.success ? _.data : null
}

export function setItem(key: "recent-room-id", value: Room["id"]): void

export function setItem(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

type SafeParseResult =
  | {
      success: true
      data: unknown
    }
  | {
      success: false
    }

function safeParse(text: string): SafeParseResult {
  try {
    return {
      success: true,
      data: JSON.parse(text),
    }
  } catch {
    return {
      success: false,
    }
  }
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("safeParse", () => {
    const _ = safeParse("")

    expect(_).toStrictEqual<SafeParseResult>({
      success: false,
    })
  })
}
