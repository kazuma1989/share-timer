import { createContext } from "./createContext"

export const [VideoTimerProvider, useVideoTimer] =
  createContext<HTMLVideoElement>("VideoTimerProvider")

export function createVideoTimer(): HTMLVideoElement {
  const video = document.createElement("video")
  video.setAttribute("role", "timer")

  // フォーカス可能にしておかないと VoiceOver が読んでくれない
  video.tabIndex = 0

  // 自動再生可能なように muted, playsInline はともに true.
  video.autoplay = true
  video.muted = true
  video.playsInline = true

  return video
}
