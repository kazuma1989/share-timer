import { FieldValue, Timestamp } from "firebase/firestore"
import * as z from "zod"

export type Action = z.output<typeof actionZod>

export type ActionOnFirestore = z.input<typeof actionZod>

const timestamp = z
  .instanceof(Timestamp)
  .or(z.custom<FieldValue>((_) => _ instanceof FieldValue))

const timestampToMillis = timestamp.transform((t) =>
  t instanceof Timestamp ? t.toMillis() : NaN
)

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
