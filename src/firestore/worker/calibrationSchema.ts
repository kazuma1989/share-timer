import { Timestamp } from "firebase/firestore"
import * as s from "superstruct"

export interface Calibration extends s.Infer<typeof calibrationSchema> {}

export const calibrationSchema = /*@__PURE__*/ (() =>
  s.type({
    clientTime: s.instance(Timestamp),
    serverTime: s.instance(Timestamp),
  }))()
