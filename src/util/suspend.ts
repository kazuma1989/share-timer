export function suspend(until: () => PromiseLike<unknown> | unknown): never {
  throw Promise.resolve().then(until)
}
