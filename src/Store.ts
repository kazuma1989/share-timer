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

  private readonly listeners = new Set<Listener>()

  private latestValue: T | typeof Store.Empty = Store.Empty

  private constructor(getSubscription: GetSubscription<T>) {
    // FIXME call terminate properly
    const terminate = getSubscription((value) => {
      this.latestValue = value

      this.listeners.forEach((listener) => {
        listener()
      })
    })
  }

  subscribe = (listener: Listener): Unsubscribe => {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  getValue = (): T | typeof Store.Empty => this.latestValue

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
  (onChange: (value: T) => void): Unsubscribe
}

interface Unsubscribe {
  (): void
}

interface Listener {
  (): void
}
