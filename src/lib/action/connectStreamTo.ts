import type { Action } from "svelte/types/runtime/action"

export const connectStreamTo: Action<HTMLCanvasElement, HTMLVideoElement> = (
  canvas,
  video
) => {
  if (!video) return

  video.width = parseInt(canvas.style.width)
  video.height = parseInt(canvas.style.height)

  video.srcObject = canvas.captureStream()
}
