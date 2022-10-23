import { createContext } from "./createContext"

export const [AlertAudioProvider, useAlertAudio] =
  createContext<HTMLAudioElement>("AlertAudioProvider")
