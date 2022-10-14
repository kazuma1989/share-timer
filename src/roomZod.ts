import * as z from "zod"

export const roomZod = z.object({})

export const roomIdZod = z.string().regex(/^[A-Za-z0-9]{20}$/)

export interface Room extends z.output<typeof roomZod> {
  id: z.infer<typeof roomIdZod>
}

export interface RoomOnFirestore extends z.input<typeof roomZod> {}
