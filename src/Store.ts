export class Store<T> {
  static readonly Empty = Symbol("empty")

  private latestValue: T | typeof Store.Empty = Store.Empty

  constructor(
    private readonly getSubscription: (
      onChange: (value: T) => void
    ) => () => void
  ) {}

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
