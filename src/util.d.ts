declare type ValueOf<T> = T[keyof T]

declare type Observed<O> = O extends import("rxjs").ObservableInput<infer T>
  ? T
  : never

declare type EventNameOf<K extends `on:${string}`> = K extends `on:${infer P}`
  ? P
  : never
