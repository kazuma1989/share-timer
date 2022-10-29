import { Room } from "./zod/roomZod"

export function getItem(key: "recent-room-id"): string | null

export function getItem(key: string): unknown {
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) : null
}

export function setItem(key: "recent-room-id", value: Room["id"]): void

export function setItem(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}
