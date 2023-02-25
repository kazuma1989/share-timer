import smallAlert from "$lib/assets/small-alert.mp3"
import App from "./App.svelte"
import { defineStart } from "./defineStart"
import { firestoreImplContext } from "./firestore/firestoreImplContext"
import { initRemoteFirestore } from "./firestore/initRemoteFirestore"
import { observeAudioPermission } from "./observeAudioPermission"
import { observeHash } from "./observeHash"
import PageRoomSkeleton from "./PageRoomSkeleton.svelte"
import Skeleton from "./Skeleton.svelte"
import { createAudio, keyWithAudio, keyWithMediaPermission } from "./useAudio"
import { keyWithDarkMode, observeDarkMode } from "./useDarkMode"
import { createVideoTimer, keyWithVideoTimer } from "./useVideoTimer"

export default defineStart(async (target) => {
  const skeleton = new Skeleton({
    target,
    props: {
      skeleton: PageRoomSkeleton,
    },
  })

  const darkMode$ = observeDarkMode()

  const context = new AudioContext()
  const permission$ = observeAudioPermission(context)

  const audioData = await fetch(smallAlert).then((_) => _.arrayBuffer())
  const audio = createAudio(context, audioData)

  const video = createVideoTimer()

  const route$ = observeHash()

  const firestore = await initRemoteFirestore()

  new App({
    target: skeleton.appRoot!,
    props: {
      route$,
    },
    context: new Map([
      ...firestoreImplContext(firestore),
      keyWithAudio(audio),
      keyWithMediaPermission(permission$),
      keyWithDarkMode(darkMode$),
      keyWithVideoTimer(video),
    ]),
  })
})
