interface Timestamp {
  toMillis(): number
}

export class ServerTimestamp implements Timestamp {
  static from(timestamp: number | Timestamp): ServerTimestamp
  static from(timestamp: unknown): ServerTimestamp | null

  static from(timestamp: unknown): ServerTimestamp | null {
    if (typeof timestamp === "number") {
      return new ServerTimestamp(timestamp)
    }

    if (
      typeof timestamp === "object" &&
      timestamp &&
      "toMillis" in timestamp &&
      typeof timestamp.toMillis === "function"
    ) {
      const millis = timestamp.toMillis()

      if (typeof millis === "number") {
        return new ServerTimestamp(millis)
      }
    }

    return null
  }

  constructor(private readonly millis: number) {}

  toMillis(): number {
    return this.millis
  }
}
