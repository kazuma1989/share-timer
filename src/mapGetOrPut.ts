export function mapGetOrPut<K, V>(
  map: Map<K, V>
): (key: K, defaultValue: () => V) => V {
  return (key, defaultValue) => {
    const value = map.get(key)
    if (value) {
      return value
    }

    const newValue = defaultValue()
    map.set(key, newValue)

    return newValue
  }
}
