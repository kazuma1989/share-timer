import { wrap, type Remote } from "comlink"
import options from "../assets/init.json"
import { setTransferHandlers } from "../setTransferHandlers"
import type { RemoteFirestore } from "./worker/RemoteFirestore.worker"
import RemoteFirestoreWorker from "./worker/RemoteFirestore.worker?worker"

export async function initRemoteFirestore(): Promise<Remote<RemoteFirestore>> {
  setTransferHandlers()

  const Firestore = wrap<typeof RemoteFirestore>(new RemoteFirestoreWorker())

  return new Firestore(options)
}
