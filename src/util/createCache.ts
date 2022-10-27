export function createCache(): <K extends object, U>(
  key: K,
  getDefaultValue: () => U
) => U {
  const cache = new WeakMap<object, unknown>()

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
