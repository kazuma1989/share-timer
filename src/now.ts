import {
  doc,
  Firestore,
  getDocFromServer,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore"
import * as z from "zod"
import { collection } from "./collection"
import { withMeta } from "./withMeta"

/**
 * クライアント時刻をなるべく較正してサーバー時刻に近づけた値を返す
 */
export function now(): number {
  return _now() + _estimatedDiff
}

// eslint-disable-next-line no-restricted-globals
const _now = () => Date.now() + delta
const delta = import.meta.env.DEV
  ? Math.floor(2_000 * Math.random() - 1_000)
  : 0

/**
 * serverTimestamp() - Timestamp.now()
 */
let _estimatedDiff = 0

export async function calibrateClock(db: Firestore): Promise<void> {
  const clientDoc = doc(collection(db, "calibrations"))
  await setDoc(
    clientDoc,
    withMeta<Calibration>({
      clientTime: Timestamp.fromMillis(_now()),
      serverTime: serverTimestamp() as Timestamp,
    })
  )

  const serverDoc = await getDocFromServer(clientDoc)
  const { clientTime, serverTime } = calibrationZod.parse(serverDoc.data())

  _estimatedDiff = serverTime.toMillis() - clientTime.toMillis()

  import.meta.env.DEV &&
    console.info("diff (serverTime - clientTime)", _estimatedDiff)
}

const calibrationZod = z.object({
  clientTime: z.instanceof(Timestamp),
  serverTime: z.instanceof(Timestamp),
})

interface Calibration extends z.infer<typeof calibrationZod> {}
