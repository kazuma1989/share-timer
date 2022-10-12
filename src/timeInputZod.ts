import * as z from "zod"
import { undefined } from "zod"

const pattern = /^(?:\s*(\d+)\s*:)?\s*(\d+)\s*$/

export const timeInputZod = z
  .string()
  .regex(pattern)
  .transform((v) => {
    const [, minutesPart, secondsPart] = v.match(pattern) ?? []

    const minutes = nonNegativeInt.parse(minutesPart)
    const seconds = nonNegativeInt.parse(secondsPart)

    return minutes * 60_000 + seconds * 1_000
  })

const nanAsZero = z
  .unknown()
  .refine(Number.isNaN)
  .transform(() => 0)

const nonNegativeInt = z.preprocess(
  Number,
  z.number().nonnegative().int().or(nanAsZero)
)

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("nanAsZero", () => {
    expect(() => nanAsZero.parse({})).toThrow()
  })

  test("nanAsZero", () => {
    expect(nanAsZero.parse(Number({}))).toBe(0)
  })

  test("nonNegativeInt", () => {
    expect(nonNegativeInt.parse("124")).toBe(124)
  })

  test("nonNegativeInt", () => {
    expect(() => nonNegativeInt.parse("12.4")).toThrow()
  })

  test("nonNegativeInt", () => {
    expect(nonNegativeInt.parse(undefined)).toBe(0)
  })

  test("nonNegativeInt", () => {
    expect(() => nonNegativeInt.parse("-99")).toThrow()
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
    expect(() => timeInputZod.parse(":00")).toThrow()
  })
}
