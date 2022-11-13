export function createCache(
  hard: true
): <K, U>(key: K, getDefaultValue: () => U) => U

export function createCache(
  hard?: false
): <K extends object, U>(key: K, getDefaultValue: () => U) => U

export function createCache(
  hard?: boolean
): <K extends object, U>(key: K, getDefaultValue: () => U) => U {
  const cache = hard ? new Map() : new WeakMap<object, unknown>()

  return (key, getDefaultValue) => {
    const value = cache.get(key)
    if (value) {
      return value as ReturnType<typeof getDefaultValue>
    }

    const newValue = getDefaultValue()
    cache.set(key, newValue)

    return newValue
  }
}
