import {
  doc,
  Firestore,
  getDocFromServer,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore"
import { collection } from "./collection"
import { withMeta } from "./withMeta"

/**
 * クライアント時刻をなるべく較正してサーバー時刻に近づけた値を返す
 */
export function now(): number {
  // eslint-disable-next-line no-restricted-globals
  return Date.now() + _estimatedDiff
}

/**
 * serverTimestamp() - Date.now()
 */
let _estimatedDiff = 0

export async function calibrateClock(db: Firestore): Promise<void> {
  const clientDoc = doc(collection(db, "calibrations"))
  await setDoc(
    clientDoc,
    // TODO zod type check
    withMeta({
      clientTime: Timestamp.now(),
      serverTime: serverTimestamp(),
    })
  )

  const serverDoc = await getDocFromServer(clientDoc)
  // TODO zod validation
  const { clientTime, serverTime } = serverDoc.data()! as {
    clientTime: Timestamp
    serverTime: Timestamp
  }

  _estimatedDiff = serverTime.toMillis() - clientTime.toMillis()

  import.meta.env.DEV &&
    console.info("diff (serverTime - clientTime)", _estimatedDiff)
}
