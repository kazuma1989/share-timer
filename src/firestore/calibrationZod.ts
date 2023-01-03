import { Timestamp } from "firebase/firestore"
import * as z from "zod"

export interface Calibration extends z.infer<typeof calibrationZod> {}

export const calibrationZod = z.object({
  clientTime: z.instanceof(Timestamp),
  serverTime: z.instanceof(Timestamp),
})
