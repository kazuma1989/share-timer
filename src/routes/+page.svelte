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
  import { observeHash } from "../observeHash"
  import PageRoomSkeleton from "../PageRoomSkeleton.svelte"
  import { keyWithDarkMode, observeDarkMode } from "../useDarkMode"
  import { createVideoTimer, keyWithVideoTimer } from "../useVideoTimer"

  const setup$ = (async () => {
    if (!browser) throw "not CSR"

    const darkMode$ = observeDarkMode()

    const context = new AudioContext()
    const permission$ = observeAudioPermission(context)

    const audioData = await fetch(smallAlert).then((_) => _.arrayBuffer())
    const audio = createAudio(context, audioData)

    const video = createVideoTimer()

    const route$ = observeHash()

    const firestore = await initRemoteFirestore()

    return {
      route$,
      context: new Map([
        ...firestoreImplContext(firestore),
        keyWithAudio(audio),
        keyWithMediaPermission(permission$),
        keyWithDarkMode(darkMode$),
        keyWithVideoTimer(video),
      ]),
    }
  })()
</script>

<div class="peer contents">
  {#await setup$ then { context, route$ }}
    <SetContext {context}>
      <App {route$} />
    </SetContext>
  {/await}
</div>

<div class="hidden peer-empty:contents">
  <PageRoomSkeleton />
</div>
