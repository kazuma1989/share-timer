// @ts-expect-error
import { Reducer, useReducer } from "react"
import { useObservable } from "./useObservable"

interface Add {
  <T extends PromiseLike<unknown>>(promise: T): T
}

export function useAllSettled(): [allSettled: boolean, add: Add] {
  const [[, promise], dispatch] = useReducer<
    Reducer<
      [Set<PromiseLike<unknown>>, PromiseLike<boolean>],
      PromiseLike<unknown>
    >
  >(
    (
      // @ts-expect-error
      state,
      // @ts-expect-error
      promise
    ) => {
      const [currentPromises] = state
      if (currentPromises.has(promise)) {
        return state
      }

      const newPromises = new Set(currentPromises.values()).add(promise)
      return [
        newPromises,
        Promise.allSettled(newPromises).then(() => {
          newPromises.clear()
          return true
        }),
      ]
    },
    [new Set(), Promise.resolve(true)]
  )

  const allSettled = useObservable(promise, true)

  const add: Add = (promise) => {
    dispatch(promise)
    return promise
  }

  return [allSettled, add]
}
