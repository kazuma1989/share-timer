import { createContext } from "./createContext"

const [AlertAudioProvider, useAlertAudio] =
  createContext<HTMLAudioElement>("AlertAudioProvider")

export { AlertAudioProvider, useAlertAudio }
