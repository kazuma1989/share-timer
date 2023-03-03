import { browser } from "$app/environment"
import smallAlert from "$lib/assets/small-alert.mp3"
import { firestoreImplContext } from "$lib/firestore/firestoreImplContext"
import { initRemoteFirestore } from "$lib/firestore/initRemoteFirestore"
import { observeAudioPermission } from "$lib/observeAudioPermission"
import {
  createAudio,
  keyWithAudio,
  keyWithMediaPermission,
} from "$lib/useAudio"
import { keyWithDarkMode, observeDarkMode } from "$lib/useDarkMode"
import { createVideoTimer, keyWithVideoTimer } from "$lib/useVideoTimer"
import type { LayoutLoad } from "./$types"

export const load = (async ({ parent, fetch }) => {
  if (!browser) {
    return {}
  }

  const darkMode$ = observeDarkMode()

  const context = new AudioContext()
  const permission$ = observeAudioPermission(context)

  const audioData = await fetch(smallAlert).then((_) => _.arrayBuffer())
  const audio = createAudio(context, audioData)

  const video = createVideoTimer()

  const data = await parent()
  const firestore = await initRemoteFirestore(data.options)

  return {
    firestore,
    context: new Map([
      ...firestoreImplContext(firestore),
      keyWithAudio(audio),
      keyWithMediaPermission(permission$),
      keyWithDarkMode(darkMode$),
      keyWithVideoTimer(video),
    ]),
  }
}) satisfies LayoutLoad
