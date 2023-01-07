import {
  doc,
  Firestore,
  getDocFromServer,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore"
import { now, setEstimatedDiff } from "../now"
import { calibrationZod, type Calibration } from "./calibrationZod"
import { collection } from "./collection"
import { withMeta } from "./withMeta"

export async function calibrateClock(db: Firestore): Promise<void> {
  const clientDoc = doc(collection(db, "calibrations"))
  await setDoc(
    clientDoc,
    withMeta({
      clientTime: Timestamp.fromMillis(now()),
      serverTime: serverTimestamp() as Timestamp,
    } satisfies Calibration)
  )

  const serverDoc = await getDocFromServer(clientDoc)
  const { clientTime, serverTime } = calibrationZod.parse(serverDoc.data())

  setEstimatedDiff(serverTime.toMillis() - clientTime.toMillis())
}
