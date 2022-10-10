export class Store<V> {
  static readonly Empty = Symbol("empty")

  private latestValue: V | typeof Store.Empty = Store.Empty

  constructor(
    private readonly getSubscription: (
      onChange: (value: V) => void
    ) => () => void
  ) {}

  subscribe = (onStoreChange: () => void): (() => void) =>
    this.getSubscription((value) => {
      this.latestValue = value
      onStoreChange()
    })

  getOrThrow = (): V => {
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
