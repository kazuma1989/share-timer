import { expose } from "comlink"

export class Firestore {
  snapshot() {
    console.log("snapshot from worker")
  }
}

expose(Firestore)
