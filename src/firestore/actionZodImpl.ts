import {
  serverTimestamp as firestoreServerTimestamp,
  Timestamp,
} from "firebase/firestore"
import * as z from "zod"
import { serverTimestamp, ServerTimestamp } from "../util/ServerTimestamp"
import type { ActionInput } from "../zod/actionZod"

export const toFirestore = z
  .object({
    at: z
      .literal(serverTimestamp)
      .transform(() => firestoreServerTimestamp())
      .optional(),
  })
  .passthrough()

export const fromFirestore = z
  .object({
    at: z
      .instanceof(Timestamp)
      .transform((_) => new ServerTimestamp(_.toMillis()))
      .optional(),
  })
  .passthrough()

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("toFirestore", () => {
    const action: ActionInput = {
      type: "start",
      at: serverTimestamp,
      withDuration: 60_000 * 3,
    }

    // FIXME ts-expect-error
    // @ts-expect-error
    action satisfies z.input<typeof toFirestore>

    expect(toFirestore.parse(action)).toMatchObject({
      type: "start",
      withDuration: 60_000 * 3,
    } satisfies Partial<ActionInput>)
  })

  test("fromFirestore", () => {
    const action: ActionInput = {} as any

    if (action.type !== "cancel") {
      // FIXME ts-expect-error
      // @ts-expect-error
      action satisfies z.output<typeof fromFirestore>
    }
  })
}
