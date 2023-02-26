<script lang="ts">
  import { browser } from "$app/environment"
  import smallAlert from "$lib/assets/small-alert.mp3"
  import { observeAudioPermission } from "$lib/observeAudioPermission"
  import { observeRoute } from "$lib/observeHash"
  import SetContext from "$lib/SetContext.svelte"
  import {
    createAudio,
    keyWithAudio,
    keyWithMediaPermission,
  } from "$lib/useAudio"
  import App from "../../App.svelte"
  import { firestoreImplContext } from "../../firestore/firestoreImplContext"
  import { initRemoteFirestore } from "../../firestore/initRemoteFirestore"
  import PageRoomSkeleton from "../../PageRoomSkeleton.svelte"
  import { keyWithDarkMode, observeDarkMode } from "../../useDarkMode"
  import { createVideoTimer, keyWithVideoTimer } from "../../useVideoTimer"

  const route$ = browser ? observeRoute() : null

  async function setup() {
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
  }
</script>

<div class="peer contents">
  {#await setup() then context}
    <SetContext {context}>
      {#if route$}
        <App {route$} />
      {/if}
    </SetContext>
  {/await}
</div>

<div class="hidden peer-empty:contents">
  <PageRoomSkeleton />
</div>
