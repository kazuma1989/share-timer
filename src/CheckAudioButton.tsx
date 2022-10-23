import { CircleButton } from "./CircleButton"
import { useMedia } from "./useMedia"
import { useObservable } from "./useObservable"
import { setTimeout } from "./util/setTimeout"

export function CheckAudioButton() {
  const [audio, permission] = useObservable(useMedia(), [
    new Audio(),
    "denied" as const,
  ])

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
      なる
    </CircleButton>
  ) : (
    <CircleButton>ならない</CircleButton>
  )
}
