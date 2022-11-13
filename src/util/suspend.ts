export function suspend(until: () => void): never {
  throw Promise.resolve().then(until)
}
