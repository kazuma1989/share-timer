export const serverTimestamp = Symbol.for("serverTimestamp")

export function toMillis(timestamp: Timestamp): number {
  return timestamp.seconds * 1000 + timestamp.nanoseconds / MS_TO_NANOS
}

export function fromMillis(milliseconds: number): Timestamp {
  const seconds = Math.floor(milliseconds / 1000)
  const nanoseconds = Math.floor((milliseconds - seconds * 1000) * MS_TO_NANOS)

  return { seconds, nanoseconds }
}

export class ServerTimestamp implements Timestamp {
  static toMillis(timestamp: Timestamp): number {
    return toMillis(timestamp)
  }

  readonly seconds: number
  readonly nanoseconds: number

  constructor(
    milliseconds: number,
    public readonly type: "client-estimate" | "server-fixed" = "client-estimate"
  ) {
    const _ = fromMillis(milliseconds)

    this.seconds = _.seconds
    this.nanoseconds = _.nanoseconds
  }
}

export interface Timestamp {
  seconds: number
  nanoseconds: number
}

const MS_TO_NANOS = 1000_000
