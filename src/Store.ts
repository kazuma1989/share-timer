export class Store<T> {
  static readonly Empty = Symbol("empty")

  static from<T>(callback: GetSubscription<T>): Store<T>
  static from<T>(promise: PromiseLike<T>): Store<T>
  static from<T>(seed: GetSubscription<T> | PromiseLike<T>): Store<T> {
    return new Store(
      typeof seed === "function"
        ? seed
        : (onChange) => {
            const abort = new AbortController()

            seed.then((value) => {
              if (abort.signal.aborted) return
              onChange(value)
            })

            return () => {
              abort.abort()
            }
          }
    )
  }

  private latestValue: T | typeof Store.Empty = Store.Empty

  private constructor(private readonly getSubscription: GetSubscription<T>) {}

  subscribe = (onStoreChange: () => void): (() => void) =>
    this.getSubscription((value) => {
      this.latestValue = value
      onStoreChange()
    })

  get = (): T | typeof Store.Empty => {
    return this.latestValue
  }

  getOrThrow = (): T => {
    if (this.latestValue !== Store.Empty) {
      return this.latestValue
    }

    throw new Promise<void>((resolve) => {
      const unsubscribe = this.subscribe(() => {
        unsubscribe()
        resolve()
      })
    })
  }
}

interface GetSubscription<T> {
  (onChange: (value: T) => void): () => void
}
