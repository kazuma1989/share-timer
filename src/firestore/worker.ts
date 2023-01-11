import { expose } from "comlink"

function snapshot() {
  console.log("snapshot from worker")
}

expose(snapshot)

export type snapshot = typeof snapshot
