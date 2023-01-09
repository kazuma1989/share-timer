import { createContext } from "./createContext"

export const [keyWithVideoTimer, useVideoTimer] =
  createContext<HTMLVideoElement>("VideoTimer")

export function createVideoTimer(): HTMLVideoElement {
  const video = document.createElement("video")
  video.setAttribute("role", "timer")

  // フォーカス可能にしておかないと VoiceOver が読んでくれない
  video.tabIndex = 0

  // 自動再生可能なように muted, playsInline はともに true.
  video.autoplay = true
  video.muted = true
  video.playsInline = true

  // controls off にしておくので、扱いやすいようなイベントをあらかじめ付与
  video.addEventListener(
    "click",
    () => {
      video.play()
    },
    { passive: true }
  )

  video.addEventListener(
    "dblclick",
    () => {
      video.requestPictureInPicture()
    },
    { passive: true }
  )

  return video
}
