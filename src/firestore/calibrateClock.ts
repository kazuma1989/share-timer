import {
  doc,
  Firestore,
  getDocFromServer,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore"
import { now, setEstimatedDiff } from "../now"
import { Calibration, calibrationZod } from "../zod/calibrationZod"
import { collection } from "./collection"
import { withMeta } from "./withMeta"

export async function calibrateClock(db: Firestore): Promise<void> {
  const clientDoc = doc(collection(db, "calibrations"))
  await setDoc(
    clientDoc,
    withMeta<Calibration>({
      clientTime: Timestamp.fromMillis(now()),
      serverTime: serverTimestamp() as Timestamp,
    })
  )

  const serverDoc = await getDocFromServer(clientDoc)
  const { clientTime, serverTime } = calibrationZod.parse(serverDoc.data())

  setEstimatedDiff(serverTime.toMillis() - clientTime.toMillis())
}
