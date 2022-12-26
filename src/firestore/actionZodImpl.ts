import { Timestamp } from "firebase/firestore"
import * as z from "zod"
import { ServerTimestamp } from "../util/ServerTimestamp"
import { ActionInput } from "../zod/actionZod"

const timestampToTimestamp = z
  .instanceof(Timestamp)
  .transform((_) => new ServerTimestamp(_.toMillis()))

export const actionZodImpl = z.union([
  z.object({
    type: z.literal("start"),
    withDuration: z.number(),
    at: timestampToTimestamp,
  }),

  z.object({
    type: z.literal("pause"),
    at: timestampToTimestamp,
  }),

  z.object({
    type: z.literal("resume"),
    at: timestampToTimestamp,
  }),

  z.object({
    type: z.literal("cancel"),
    withDuration: z.number().optional(),
  }),
])

if (import.meta.vitest) {
  const { test } = import.meta.vitest

  test("一応型の整合テストはできるが、unionが不足していることは検知できない", () => {
    actionZodImpl.parse({}) satisfies ActionInput
  })
}
