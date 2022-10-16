import { FieldValue, Timestamp } from "firebase/firestore"
import * as z from "zod"

const timestamp = z
  .instanceof(Timestamp)
  .or(z.custom<FieldValue>((_) => _ instanceof FieldValue))

const timestampToMillis = timestamp.transform((t) =>
  t instanceof Timestamp ? t.toMillis() : NaN
)

export const actionZod = z.union([
  z.object({
    type: z.literal("edit"),
  }),

  z.object({
    type: z.literal("edit-done"),
    duration: z.number(),
  }),

  z.object({
    type: z.literal("start"),
    at: timestampToMillis,
  }),

  z.object({
    type: z.literal("pause"),
    at: timestampToMillis,
  }),
])

export type Action = z.output<typeof actionZod>

export type ActionOnFirestore = z.input<typeof actionZod>
