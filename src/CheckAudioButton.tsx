import { useState, useSyncExternalStore } from "react"
import { CircleButton } from "./CircleButton"
import smallAlert from "./sound/small-alert.mp3"
import { checkAudioPermission } from "./util/checkAudioPermission"
import { createStore } from "./util/createStore"
import { setTimeout } from "./util/setTimeout"

const audio = new Audio(smallAlert)

export function CheckAudioButton() {
  const getStore = () => createStore(checkAudioPermission(audio), "denied")

  const [store, setStore] = useState(getStore)
  const permission = useSyncExternalStore(store.subscribe, store.getSnapshot)

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
    <CircleButton
      onClick={() => {
        setStore(getStore())
      }}
    >
      ならない
    </CircleButton>
  )
}
