import * as s from "superstruct"
import {
  serverTimestamp,
  toMillis,
  type Timestamp,
} from "../util/ServerTimestamp"

export type Action = TimestampFieldToMillis<ActionInput>

export type ActionInput = s.Infer<typeof actionZod>

type TimestampFieldToMillis<T> = {
  [P in keyof T]: TimestampToMillis<T[P]>
}

type TimestampToMillis<T> = T extends typeof serverTimestamp | Timestamp
  ? number
  : T

export function coerceTimestamp<T extends Record<string, unknown>>(
  value: T
): TimestampFieldToMillis<T> {
  return Object.fromEntries(
    Object.entries(value).map(([key, value]) => [
      key,
      s.is(value, timestamp)
        ? value === serverTimestamp
          ? // eslint-disable-next-line no-restricted-globals
            Date.now()
          : toMillis(value)
        : value,
    ])
  ) as any
}

const timestamp = s.union([
  s.literal(serverTimestamp),
  s.object({
    seconds: s.number(),
    nanoseconds: s.number(),
  }) satisfies s.Describe<Timestamp> as s.Describe<Timestamp>,
])

export const actionZod = s.union([
  s.object({
    type: s.literal("start"),
    withDuration: s.number(),
    at: timestamp,
  }),

  s.object({
    type: s.literal("pause"),
    at: timestamp,
  }),

  s.object({
    type: s.literal("resume"),
    at: timestamp,
  }),

  s.object({
    type: s.literal("cancel"),
    withDuration: s.optional(s.number()),
  }),
])
