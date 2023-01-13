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

const timestamp = /*@__PURE__*/ s.union([
  /*@__PURE__*/ s.literal(serverTimestamp),
  /*@__PURE__*/ s.type({
    seconds: /*@__PURE__*/ s.number(),
    nanoseconds: /*@__PURE__*/ s.number(),
  }) satisfies s.Describe<Timestamp> as s.Describe<Timestamp>,
])

export const actionZod = /*@__PURE__*/ s.union([
  /*@__PURE__*/ s.type({
    type: /*@__PURE__*/ s.literal("start"),
    withDuration: /*@__PURE__*/ s.number(),
    at: timestamp,
  }),

  /*@__PURE__*/ s.type({
    type: /*@__PURE__*/ s.literal("pause"),
    at: timestamp,
  }),

  /*@__PURE__*/ s.type({
    type: /*@__PURE__*/ s.literal("resume"),
    at: timestamp,
  }),

  /*@__PURE__*/ s.type({
    type: /*@__PURE__*/ s.literal("cancel"),
    withDuration: /*@__PURE__*/ s.optional(/*@__PURE__*/ s.number()),
  }),
])
