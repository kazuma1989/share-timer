import { wrap, type Remote } from "comlink"
import type { RemoteAuth } from "./worker/RemoteAuth.worker"
import RemoteAuthWorker from "./worker/RemoteAuth.worker?worker"

export async function initRemoteAuth(): Promise<Remote<RemoteAuth>> {
  const Auth = wrap<typeof RemoteAuth>(new RemoteAuthWorker())

  return new Auth(await fetch("/__/firebase/init.json").then((_) => _.json()))
}
