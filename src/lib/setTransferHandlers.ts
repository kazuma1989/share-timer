import { transferHandlers, type TransferHandler } from "comlink"

export function setTransferHandlers(): void {
  transferHandlers.set("serializeSymbol", {
    canHandle(value): value is Record<string, unknown> {
      return hasSymbol(value)
    },

    serialize(value) {
      return [serializeSymbol(value), []]
    },

    deserialize(value) {
      return deserializeSymbol(value)
    },
  } satisfies TransferHandler<Record<string, unknown>, Record<string, unknown>>)
}

type SerializedSymbol = ["__symbol__", string | undefined]

function isSerializedSymbol(value: unknown): value is SerializedSymbol {
  if (Array.isArray(value) && value.length === 2) {
    const [identifier, payload] = value

    if (identifier === ("__symbol__" satisfies SerializedSymbol[0])) {
      return typeof payload === "string" || typeof payload === "undefined"
    }
  }

  return false
}

function hasSymbol(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false
  }

  return Object.values(value).some((_) => typeof _ === "symbol")
}

function serializeSymbol<T extends Record<string, unknown>>(
  value: T
): { [P in keyof T]: T[P] extends symbol ? SerializedSymbol : T[P] } {
  return Object.fromEntries(
    Object.entries(value).map(([key, value]) => [
      key,
      typeof value === "symbol"
        ? (["__symbol__", Symbol.keyFor(value)] satisfies SerializedSymbol)
        : value,
    ])
  ) as any
}

function deserializeSymbol<T extends Record<string, unknown>>(
  value: T
): { [P in keyof T]: T[P] extends SerializedSymbol ? symbol : T[P] } {
  return Object.fromEntries(
    Object.entries(value).map(([key, value]) => [
      key,
      isSerializedSymbol(value)
        ? typeof value[1] === "undefined"
          ? Symbol()
          : Symbol.for(value[1])
        : value,
    ])
  ) as any
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test("isSerializedSymbol", () => {
    expect(
      isSerializedSymbol(["__symbol__", ""] satisfies SerializedSymbol)
    ).toBeTruthy()

    expect(
      isSerializedSymbol(["__symbol__", undefined] satisfies SerializedSymbol)
    ).toBeTruthy()

    expect(
      isSerializedSymbol(
        // @ts-expect-error satisfies していないことをたしかめている
        ["__symbol__"] satisfies SerializedSymbol
      )
    ).toBeFalsy()
  })

  test("hasSymbol", () => {
    expect(
      hasSymbol({
        x: "X",
        y: Symbol.for("Y"),
      })
    ).toBeTruthy()

    expect(
      hasSymbol({
        z: "Z",
      })
    ).toBeFalsy()

    expect(hasSymbol(null)).toBeFalsy()
  })

  test("serializeSymbol", () => {
    const x = serializeSymbol({
      a: "A",
      b: Symbol.for("B"),
    })

    expect(x).toStrictEqual({
      a: "A",
      b: ["__symbol__", "B"],
    } satisfies typeof x)
  })

  test("deserializeSymbol", () => {
    const x = deserializeSymbol({
      c: "C",
      d: ["__symbol__", "D"] satisfies SerializedSymbol,
    })

    expect(x).toStrictEqual({
      c: "C",
      d: Symbol.for("D"),
    } satisfies typeof x)
  })
}
