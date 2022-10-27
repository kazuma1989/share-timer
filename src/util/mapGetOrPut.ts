export function mapGetOrPut(): <K extends object, U>(
  key: K,
  getDefaultValue: () => U
) => U {
  const map = new WeakMap<object, unknown>()

  return (key, getDefaultValue) => {
    const value = map.get(key)
    if (value) {
      return value as ReturnType<typeof getDefaultValue>
    }

    const newValue = getDefaultValue()
    map.set(key, newValue)

    return newValue
  }
}
