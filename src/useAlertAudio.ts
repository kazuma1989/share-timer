import { createContext, useContext } from "react"

const alertAudioContext = createContext<HTMLAudioElement | null>(null)

export const AlertAudioProvider = alertAudioContext.Provider

export function useAlertAudio(): HTMLAudioElement {
  const audio = useContext(alertAudioContext)
  if (!audio) {
    throw new Error("AlertAudioProviderで囲んでいないかvalueがnullです")
  }

  return audio
}
