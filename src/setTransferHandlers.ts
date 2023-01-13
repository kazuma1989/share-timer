import { transferHandlers, type TransferHandler } from "comlink"

export function setTransferHandlers(): void {
  const symbolKey = "serverTimestamp"
  const symbolValue = Symbol.for(symbolKey)

  transferHandlers.set(symbolKey, {
    canHandle(value): value is typeof symbolValue {
      return value === symbolValue
    },

    serialize() {
      return [symbolKey, []]
    },

    deserialize() {
      return symbolValue
    },
  } satisfies TransferHandler<typeof symbolValue, typeof symbolKey>)
}
