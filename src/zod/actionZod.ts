import * as z from "zod"
import { ServerTimestamp } from "../util/ServerTimestamp"

export type Action = z.output<typeof actionZod>

export type ActionInput = z.input<typeof actionZod>

const timestampToMillis = z
  .instanceof(ServerTimestamp)
  .transform((_) => _.millis)

export const actionZod = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("start"),
    withDuration: z.number(),
    at: timestampToMillis,
  }),

  z.object({
    type: z.literal("pause"),
    at: timestampToMillis,
  }),

  z.object({
    type: z.literal("resume"),
    at: timestampToMillis,
  }),

  z.object({
    type: z.literal("cancel"),
    withDuration: z.number().optional(),
  }),
])
