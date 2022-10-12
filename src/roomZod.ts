import { Timestamp } from "firebase/firestore"
import { z } from "zod"

export const roomZod = z.object({
  lastEditAt: z.instanceof(Timestamp),
})

export interface Room extends z.output<typeof roomZod> {
  id: string
}

export interface RoomOnFirestore extends z.input<typeof roomZod> {}
