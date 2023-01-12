export class ServerTimestamp implements Timestamp {
  static toMillis(timestamp: Timestamp): number {
    return timestamp.seconds * 1000 + timestamp.nanoseconds / MS_TO_NANOS
  }

  readonly seconds: number
  readonly nanoseconds: number

  constructor(milliseconds: number) {
    const seconds = Math.floor(milliseconds / 1000)
    const nanos = Math.floor((milliseconds - seconds * 1000) * MS_TO_NANOS)

    this.seconds = seconds
    this.nanoseconds = nanos
  }
}

interface Timestamp {
  seconds: number
  nanoseconds: number
}

const MS_TO_NANOS = 1000_000
