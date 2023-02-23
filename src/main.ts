import App from "./App.svelte"
import AppSkeleton from "./AppSkeleton.svelte"
import { firestoreImplContext } from "./firestore/firestoreImplContext"
import { initRemoteFirestore } from "./firestore/initRemoteFirestore"
import { observeAudioPermission } from "./observeAudioPermission"
import { observeHash } from "./observeHash"
import smallAlert from "./sound/small-alert.mp3"
import { createAudio, keyWithAudio, keyWithMediaPermission } from "./useAudio"
import { keyWithDarkMode, observeDarkMode } from "./useDarkMode"

export default async function start(target: HTMLElement): Promise<void> {
  const skeleton = new AppSkeleton({
    target,
  })

  // https://neos21.net/blog/2018/08/19-01.html
  document.body.addEventListener("touchstart", () => {}, { passive: true })

  const darkMode$ = observeDarkMode()

  const context = new AudioContext()
  const permission$ = observeAudioPermission(context)

  const audioData = await fetch(smallAlert).then((_) => _.arrayBuffer())
  const audio = createAudio(context, audioData)

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
    ]),
  })
}
