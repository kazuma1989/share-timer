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

  private observable: Observable<T>

  private constructor(getSubscription: GetSubscription<T>) {
    this.observable = new Observable(getSubscription)
  }

  subscribe = (onStoreChange: Listener): Unsubscribe =>
    this.observable.subscribe(onStoreChange)

  getValue = (): T | typeof Store.Empty => {
    const value = this.observable.getValue()
    if (value !== Observable.Empty) {
      return value
    }

    return Store.Empty
  }

  getOrThrow = (): T => {
    const value = this.getValue()
    if (value !== Store.Empty) {
      return value
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

class Observable<T> {
  static readonly Empty = Symbol("empty")

  readonly terminate: () => void

  private readonly listeners = new Set<Listener>()

  private latestValue: T | typeof Observable.Empty = Observable.Empty

  constructor(getSubscription: GetSubscription<T>) {
    this.terminate = getSubscription((value) => {
      this.latestValue = value

      this.listeners.forEach((listener) => {
        listener()
      })
    })
  }

  subscribe(listener: Listener): Unsubscribe {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  getValue(): T | typeof Observable.Empty {
    return this.latestValue
  }

  // TODO
  toPromise(): Promise<any> {
    return Promise.resolve()
  }
}
