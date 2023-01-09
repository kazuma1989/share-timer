import { getContext } from "svelte"

export function createContext<T>(
  name?: string,
  defaultValue?: T
): [keyWithContext: (value: T) => [typeof key, T], useContextValue: () => T] {
  const key = Symbol()

  return [
    (value) => [key, value],

    () => {
      const value = getContext<T | undefined>(key)
      if (value !== undefined) {
        return value
      }

      if (defaultValue !== undefined) {
        return defaultValue
      }

      throw new Error(`Context (${name}) を設定できていないようです`)
    },
  ]
}
