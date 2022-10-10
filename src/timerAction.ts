import { Timestamp } from "firebase/firestore"
import { z } from "zod"

export const timerAction = z.union([
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

export type TimerAction = z.output<typeof timerAction>

export type TimerActionOnFirestore = z.input<typeof timerAction>
