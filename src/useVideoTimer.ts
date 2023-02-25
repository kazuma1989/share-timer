import { createContext } from "./createContext"

export const [keyWithVideoTimer, useVideoTimer] =
  createContext<HTMLVideoElement>("VideoTimer")

export function createVideoTimer(): HTMLVideoElement {
  const video = window.document.createElement("video")
  video.setAttribute("role", "timer")

  // フォーカス可能にしておかないと VoiceOver が読んでくれない
  video.tabIndex = 0

  // 自動再生可能なように muted, playsInline はともに true.
  video.autoplay = true
  video.muted = true
  video.playsInline = true

  const play = video.play.bind(video)
  const requestPictureInPicture = video.requestPictureInPicture.bind(video)

  // controls off にしておくので、扱いやすいようなイベントをあらかじめ付与
  video.addEventListener("click", play, { passive: true })
  video.addEventListener("dblclick", requestPictureInPicture, { passive: true })

  // なるべく再生状態を維持する（タイマーの再生・停止の概念もあってややこしくなるため）
  video.addEventListener("pause", play, { passive: true })

  return video
}
