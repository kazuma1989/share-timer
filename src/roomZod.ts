import * as z from "zod"

export const roomZod = z.object({
  name: z.string().max(1_000).optional(),
})

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

  test("room name", () => {
    const room = {
      name: "彅瀉".repeat(1_000 / 2),
    }

    expect(roomZod.parse(room)).toStrictEqual(room)
  })

  test("invalid room name", () => {
    expect(() =>
      roomZod.parse({
        name: "𩸽".repeat(501),
      })
    ).toThrow(z.ZodError)
  })
}
