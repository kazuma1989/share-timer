import * as z from "zod"
import { undefined, ZodError } from "zod"

const nonNegativeInt = z.preprocess(Number, z.number().nonnegative().int())

export const timeInputZod = z
  .preprocess(
    (_) =>
      typeof _ === "string" ? _.replaceAll(/\s/g, "").split(":").reverse() : _,
    z.array(nonNegativeInt).nonempty()
  )
  .transform(([seconds, minutes = 0]) => minutes * 60_000 + seconds * 1_000)

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("nonNegativeInt", () => {
    expect(nonNegativeInt.parse("124")).toBe(124)
  })

  test("nonNegativeInt", () => {
    expect(() => nonNegativeInt.parse("12.4")).toThrow(ZodError)
  })

  test("nonNegativeInt", () => {
    expect(() => nonNegativeInt.parse(undefined)).toThrow(ZodError)
  })

  test("nonNegativeInt", () => {
    expect(() => nonNegativeInt.parse("-99")).toThrow(ZodError)
  })

  test("basic", () => {
    expect(timeInputZod.parse("5:00")).toBe(5 * 60_000)
  })

  test("white spaces", () => {
    expect(timeInputZod.parse(" 3    :  01   ")).toBe(3 * 60_000 + 1_000)
  })

  test("only seconds part", () => {
    expect(timeInputZod.parse("60")).toBe(60_000)
  })

  test("invalid format", () => {
    expect(() => timeInputZod.parse("x:00")).toThrow(ZodError)
  })
}
