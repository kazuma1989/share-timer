import { createContext } from "./createContext"

export const [VideoTimerProvider, useVideoTimer] =
  createContext<HTMLVideoElement>("VideoTimerProvider")
