import * as z from "zod"
import { ServerTimestamp } from "../util/ServerTimestamp"

export type Action = z.output<typeof actionZod>

export type ActionInput = z.input<typeof actionZod>

const timestampToMillis = z
  .instanceof(ServerTimestamp)
  .transform((t) => t.toMillis())

export const actionZod = z.union([
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
