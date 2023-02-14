export function collection<T extends "checkout-sessions-dev">(path: T): T {
  return path
}

export function document<T extends "checkout-sessions-dev/{id}">(path: T): T {
  return path
}
