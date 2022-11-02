import * as z from "zod"

export interface Room extends z.output<typeof roomZod> {
  id: z.infer<typeof roomIdZod>
}

export interface RoomOnFirestore extends z.input<typeof roomZod> {}

export const roomZod = z.object({
  name: z.string().max(1_000).optional(),
})

export const roomIdZod = z
  .string()
  .regex(/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/)
  .brand()

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("room id", () => {
    expect(roomIdZod.parse("cnz-some-fmy")).toBe("cnz-some-fmy")
  })

  test("invalid room id", () => {
    expect(() => roomIdZod.parse("-cnz-some-fmy")).toThrow(z.ZodError)
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
