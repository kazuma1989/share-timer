export class Store<T> {
  static readonly Empty = Symbol("empty")

  static from<T>(callback: GetSubscription<T>): Store<T>
  static from<T>(promise: PromiseLike<T>): Store<T>
  static from<T>(seed: GetSubscription<T> | PromiseLike<T>): Store<T> {
    return new Store(typeof seed === "function" ? seed : fromPromise(seed))
  }

  private readonly listeners = new Set<Listener>()

  private readonly rootSubscription: {
    subscribe(): void
    unsubscribe(): void
  }

  private latestValue: T | typeof Store.Empty = Store.Empty

  private constructor(getSubscription: GetSubscription<T>) {
    const subscribe = () => getSubscription(this)

    let unsubscribe: Unsubscribe | null
    this.rootSubscription = {
      subscribe() {
        if (!unsubscribe) {
          unsubscribe = subscribe()
        }
      },

      unsubscribe() {
        if (unsubscribe) {
          unsubscribe()
          unsubscribe = null
        }
      },
    }
  }

  readonly next = (value: T): void => {
    this.latestValue = value

    this.listeners.forEach((listener) => {
      listener()
    })
  }

  readonly subscribe = (listener: Listener): Unsubscribe => {
    this.listeners.add(listener)
    this.rootSubscription.subscribe()

    return () => {
      this.listeners.delete(listener)

      if (this.listeners.size === 0) {
        this.rootSubscription.unsubscribe()
      }
    }
  }

  readonly getValue = (): T | typeof Store.Empty => this.latestValue

  readonly getOrThrow = (): T => {
    if (this.latestValue !== Store.Empty) {
      return this.latestValue
    }

    throw new Promise<void>((resolve) => {
      const listener = () => {
        resolve()
        this.listeners.delete(listener)
      }

      this.listeners.add(listener)
      this.rootSubscription.subscribe()
    })
  }
}

interface GetSubscription<T> {
  (store: Store<T>): Unsubscribe
}

interface Unsubscribe {
  (): void
}

interface Listener {
  (): void
}

function fromPromise<T>(promise: PromiseLike<T>): GetSubscription<T> {
  return (store) => {
    const abort = new AbortController()

    promise.then((value) => {
      if (abort.signal.aborted) return
      store.next(value)
    })

    return () => {
      abort.abort()
    }
  }
}
