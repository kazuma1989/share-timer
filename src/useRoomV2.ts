import { Observable } from "rxjs"
import { createContext } from "./createContext"
import { Room } from "./zod/roomZod"

export const [RoomProvider, useRoom] =
  createContext<Observable<Room>>("RoomProvider")
