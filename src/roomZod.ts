import { Timestamp } from "firebase/firestore"
import * as z from "zod"

export const roomZod = z.object({
  lastEditAt: z.instanceof(Timestamp),
})

export const roomIdZod = z.string().regex(/^[A-Za-z0-9]{20}$/)

export interface Room extends z.output<typeof roomZod> {
  id: z.infer<typeof roomIdZod>
}

export interface RoomOnFirestore extends z.input<typeof roomZod> {}
