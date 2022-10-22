import { useState, useSyncExternalStore } from "react"
import { CircleButton } from "./CircleButton"
import smallAlert from "./sound/small-alert.mp3"
import { checkAudioPermission } from "./util/checkAudioPermission"
import { createStore } from "./util/createStore"

export function CheckAudioButton() {
  const getStore = () => createStore(checkAudioPermission(smallAlert), "denied")

  const [store, setStore] = useState(getStore)
  const permission = useSyncExternalStore(store.subscribe, store.getSnapshot)

  return permission === "canplay" ? (
    <CircleButton>なる</CircleButton>
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
