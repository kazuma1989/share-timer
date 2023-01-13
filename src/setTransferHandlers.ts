import { transferHandlers, type TransferHandler } from "comlink"
import { serverTimestamp } from "./util/ServerTimestamp"

export function setTransferHandlers(): void {
  const symbolKey = Symbol.keyFor(serverTimestamp) ?? "serverTimestamp"
  const symbolValue = serverTimestamp

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
