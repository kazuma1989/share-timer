import * as z from "zod"

export const roomZod = z.object({})

export const roomIdZod = z
  .string()
  .regex(/^[A-Za-z0-9]{20}$/)
  .brand()

export interface Room extends z.output<typeof roomZod> {
  id: z.infer<typeof roomIdZod>
}

export interface RoomOnFirestore extends z.input<typeof roomZod> {}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("room id", () => {
    expect(roomIdZod.parse("XrhNE6G6m44uJFg6wL3p")).toBe("XrhNE6G6m44uJFg6wL3p")
  })

  test("invalid room id", () => {
    expect(() => roomIdZod.parse("_rhNE6G6m44uJFg6wL3p")).toThrow(z.ZodError)
  })
}
