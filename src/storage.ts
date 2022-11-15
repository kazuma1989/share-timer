export function getItem(key: "userId"): string | null

export function getItem(key: string): string | null {
  return localStorage.getItem(`v1/${key}`)
}

export function setItem(key: "userId", value: string): void

export function setItem(key: string, value: string): void {
  localStorage.setItem(`v1/${key}`, value)
}
