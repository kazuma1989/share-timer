<script lang="ts">
  import { browser } from "$app/environment"
  import smallAlert from "$lib/assets/small-alert.mp3"
  import { observeAudioPermission } from "$lib/observeAudioPermission"
  import SetContext from "$lib/SetContext.svelte"
  import {
    createAudio,
    keyWithAudio,
    keyWithMediaPermission,
  } from "$lib/useAudio"
  import App from "../App.svelte"
  import { firestoreImplContext } from "../firestore/firestoreImplContext"
  import { initRemoteFirestore } from "../firestore/initRemoteFirestore"
  import { observeRoute } from "../observeHash"
  import PageRoomSkeleton from "../PageRoomSkeleton.svelte"
  import { keyWithDarkMode, observeDarkMode } from "../useDarkMode"
  import { createVideoTimer, keyWithVideoTimer } from "../useVideoTimer"

  const route$ = observeRoute()

  const context$ = (async () => {
    if (!browser) throw "client-side only context"

    const darkMode$ = observeDarkMode()

    const context = new AudioContext()
    const permission$ = observeAudioPermission(context)

    const audioData = await fetch(smallAlert).then((_) => _.arrayBuffer())
    const audio = createAudio(context, audioData)

    const video = createVideoTimer()

    const firestore = await initRemoteFirestore()

    return new Map([
      ...firestoreImplContext(firestore),
      keyWithAudio(audio),
      keyWithMediaPermission(permission$),
      keyWithDarkMode(darkMode$),
      keyWithVideoTimer(video),
    ])
  })()
</script>

<div class="peer contents">
  {#await context$ then context}
    <SetContext {context}>
      <App {route$} />
    </SetContext>
  {/await}
</div>

<div class="hidden peer-empty:contents">
  <PageRoomSkeleton />
</div>
