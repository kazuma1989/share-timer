import { Timestamp } from "firebase/firestore"
import { z } from "zod"

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
    at: z.instanceof(Timestamp).transform((t) => t.toMillis()),
  }),

  z.object({
    type: z.literal("pause"),
    at: z.instanceof(Timestamp).transform((t) => t.toMillis()),
  }),
])

export type Action = z.output<typeof actionZod>

export type ActionOnFirestore = z.input<typeof actionZod>
