import { createCache } from "./createCache"

export function suspend(until: () => PromiseLike<unknown> | unknown): never {
  const suspending = cache(until, () => Promise.resolve().then(until))

  throw suspending
}

const cache = createCache()
