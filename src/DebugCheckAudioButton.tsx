import { CircleButton } from "./CircleButton"
import { icon } from "./icon"
import { useAudio, useMediaPermission } from "./useAudio"
import { useObservable } from "./useObservable"
import { setTimeout } from "./util/setTimeout"

export function DebugCheckAudioButton() {
  const audio = useAudio()
  const permission = useObservable(useMediaPermission(), "denied")

  return permission === "canplay" ? (
    <CircleButton
      onClick={async () => {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        osc.type = "sine"
        osc.connect(ctx.destination)
        osc.start()
        osc.stop(1)

        audio.play()

        await setTimeout(1_000)

        audio.pause()
        audio.currentTime = 0
        audio.play()
      }}
    >
      {icon("volume-high")}
    </CircleButton>
  ) : (
    <CircleButton>{icon("volume-off")}</CircleButton>
  )
}
