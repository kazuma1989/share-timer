import { createContext as _createContext, Provider, useContext } from "react"

export function createContext<T>(
  name?: string,
  defaultValue?: T
): [Provider: Provider<T | null>, useContextValue: () => T] {
  const context = _createContext<T | null>(defaultValue ?? null)

  return [
    context.Provider,

    () => {
      const value = useContext(context)
      if (!value) {
        throw new Error(`${name ?? "Provider"}で囲んでいないかvalueがnullです`)
      }

      return value
    },
  ]
}
