import * as z from "zod"
import { serverTimestamp, toMillis } from "../util/ServerTimestamp"

export type Action = z.output<typeof actionZod>

export type ActionInput = z.input<typeof actionZod>

const timestampToMillis = z
  .literal(serverTimestamp)
  .or(
    z.object({
      seconds: z.number(),
      nanoseconds: z.number(),
    })
  )
  .transform((_): number => (_ === serverTimestamp ? NaN : toMillis(_)))

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
